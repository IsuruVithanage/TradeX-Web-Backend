const axios = require("axios");
const dataSource = require("../config/config");
const assetRepo = dataSource.getRepository("Asset");
const getPortfolioValueData = require("./PortfolioValueController").getPortfolioValueData;
const updateTransactionHistory = require("./TransactionHistoryController").updateTransactionHistory;


const getPortfolioData = async (req, res) => {
    try {
        const userId = req.query.userId;	
        const wallet = req.params.wallet;
        let usdBalance = 0;
        let portfolioValue = 0;
        let percentages = [];


        if ( wallet !== 'overview' && wallet !== 'trading' && wallet !== 'funding') {
            return res.status(400).json({ message: 'Invalid request' });
        }

        if (!userId) {
            return res.status(404).json({ message: 'User Id not found' });
        } 

        const assets = await assetRepo.find({
            where: {
                userId: userId,
            },
        });
        

        
        await axios
            .get(
                'https://api.binance.com/api/v3/ticker/price?symbols=' + 
                "[\"" + assets
                .filter(asset => asset.symbol !== 'USD')
                .map(asset => `${asset.symbol}USDT`)
                .join('\",\"') + "\"]"
            )

            .then((res) => {
                assets.map(asset => {
                    if (asset.symbol !== 'USD') {
                        const marketPrice = res.data.find(data => data.symbol === asset.symbol + 'USDT');
                        asset.marketPrice = (marketPrice) ? parseFloat(marketPrice.price): 0;
                    }
                });
            })

            .catch((error) => {
                console.log("\nError getting markrt prices:", error);

                assets.map(asset => {
                    if (asset.symbol !== 'USD') {
                        asset.marketPrice = 0;
                    }
                });
            });



        let updatedAssets = assets.map(asset => {
            let updatedAsset = {};
            let totalBalance = 0;

            switch(wallet){
                case 'overview':
                    totalBalance = asset.tradingBalance + asset.holdingBalance + asset.fundingBalance;
                    asset.tradingBalance += asset.holdingBalance;
                    break;
                case 'trading':
                    totalBalance = asset.tradingBalance + asset.holdingBalance;
                    break;
                case 'funding':
                    totalBalance = asset.fundingBalance;
                    break;
            }

            if (asset.symbol === 'USD') {
                usdBalance = totalBalance;
                portfolioValue += totalBalance;

                if(wallet !== 'overview'){
                    updatedAsset.marketPrice = "- - -";
                    updatedAsset.value = totalBalance;
                    updatedAsset.ROI = "- - -";
                    updatedAsset.RoiColor = '#FFFFFF';
                }
            }

            else {
                updatedAsset.marketPrice = `$ ${asset.marketPrice}`;
                updatedAsset.value = ( totalBalance * asset.marketPrice );
                portfolioValue += updatedAsset.value;

                if(wallet !== 'overview'){
                    const ROI = ( asset.marketPrice - asset.AvgPurchasePrice ) * ( 100 / asset.AvgPurchasePrice );
                    updatedAsset.ROI = `${ROI.toFixed(2)} %`;
                    updatedAsset.RoiColor = ( ROI > 0 ) ? '#21DB9A' : ( ROI < 0 ) ? '#FF0000' : '#FFFFFF';
                } 
            }

            if(wallet !== 'overview' || asset.symbol !== 'USD'){
                updatedAsset.symbol = asset.symbol;
                updatedAsset.tradingBalance = asset.tradingBalance;
                updatedAsset.holdingBalance = asset.holdingBalance;
                updatedAsset.fundingBalance = asset.fundingBalance;
                updatedAsset.totalBalance = totalBalance;
            }

            if(Object.keys(updatedAsset).length > 0){
                return updatedAsset;
            }else{
                return null;
            }
        })
        .filter(asset => asset !== null)
        .sort((a, b) => b.value - a.value);



        if(wallet !== 'overview'){
            updatedAssets = [ 
                updatedAssets.find(asset => asset.symbol === 'USD'), 
                ...updatedAssets.filter(asset => asset.symbol !== 'USD') 
            ];
        }
        else{
            percentages = updatedAssets
                .map(asset => ({
                    coinName: asset.symbol,
                    percentage: (asset.value / portfolioValue) * 100
                }))

                .concat({ 
                    coinName: 'USD', 
                    percentage: (usdBalance / portfolioValue) * 100   
                })

                .sort((a, b) => b.percentage - a.percentage);
        }


        res.status(200).json({
            usdBalance: usdBalance,
            portfolioValue: portfolioValue,
            assets: updatedAssets,
            ...(wallet === 'overview' ? { 
                percentages: percentages, 
                historyData: await getPortfolioValueData(req) 
            } : {})
        }); 
    }
    catch (error) {
        console.log("\nError getting PortfolioData:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}






const addAsset = async (req, res) => {
    try {
        await assetRepo.save(req.body);

        const updatedAssets = await getAllAssets({ 
            query: { 
                userId: req.body.userId,
            }
        }, res );
        res.status(200).json(updatedAssets);
        
    } 
    
    catch (error) {
        console.log("\nError adding asset:", error);
        res.status(500).json({message: error.message});
    }
};






const tranferAsset = async (req, res) => {
    try {
        if( 
            !req.body.userId || 
            !req.body.coin || 
            !req.body.quantity || 
            !req.body.date || 
            !req.body.sendingWallet || 
            !req.body.receivingWallet
        ){ return res.status(400).json({message: 'Incomplete Request Body'}); }

        if(!/^\d{2}-\d{2}-\d{4}$/.test(req.body.date)){
            return res.status(400).json({message: 'Invalid date format'});
        }

        else{
            const assetToUpdate = await assetRepo.findOne({
                where: {
                    userId: req.body.userId,
                    symbol: req.body.coin,
                },
            })


            if (!assetToUpdate) {
                return res.status(404).json({message: 'Asset not found'});
            } 

            else {
                const senderBalance = req.body.sendingWallet.slice(0, 7).concat("Balance");
                const receiverBalance = req.body.receivingWallet.slice(0, 7).concat("Balance");

                if(req.body.quantity <= 0){
                    return res.status(400).json({message: "Invalid quantity"});
                }

                else if(req.body.quantity > assetToUpdate[senderBalance]){
                    return res.status(400).json({message: "Insufficient balance in sending wallet"});
                }

                else{
                    if(req.body.receivingWallet === 'tradingWallet' || req.body.receivingWallet === 'fundingWallet'){
                        assetToUpdate[receiverBalance]  += req.body.quantity;
                        assetToUpdate[senderBalance] -= req.body.quantity;
                    }
    
                    else{
                        // axios
                        // .get(
                        //     // external wallet API
                        // )
                        // .then((res) => {
                        //     assetToUpdate[senderBalance] -= req.body.quantity;
                        // })
                        // .catch((error) => {
                        //     res.status(500).json({message: "Transfer failed."});
                        // });
                        return res.status(500).json({message: "Transfer failed."});  
                    }
    
                    await assetRepo.save(assetToUpdate);
                    await updateTransactionHistory(req.body);
                    await CheckAssetForDelete(req.body.userId, req.body.coin);
                }
                

                req.body.sendingWallet === 'tradingWallet' ? 
                await getPortfolioData({ ...req, params: { ...req.params, wallet: "trading" } }, res) : 
                await getPortfolioData({ ...req, params: { ...req.params, wallet: "funding" } }, res);
            }
        }
    } 
    
    catch (error) {
        console.log("\nError updating asset:", error);
        res.status(error.status || 500).json({message: error.message});
    }
};






const CheckAssetForDelete = async (userId, coin) => {
    try {
        const assetToDelete = await assetRepo.findOne({
            where: {
                userId: userId,
                symbol: coin,
            },
        })

        if (!assetToDelete) {
            console.log("\nAsset not found to delete");
        } 
        
        else if(assetToDelete.tradingBalance + assetToDelete.holdingBalance + assetToDelete.fundingBalance <= 0){
            await assetRepo.remove(assetToDelete);
            console.log("\nAsset deleted");
        }
    } 
    
    catch (error) {
        console.log("\nError deleting asset:", error);
    }
};






module.exports = {
    getPortfolioData,
    addAsset,
    tranferAsset
};