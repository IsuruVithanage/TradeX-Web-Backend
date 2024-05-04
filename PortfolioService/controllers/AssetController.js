const getPortfolioValueData = require("../services/PortfolioValueService").getPortfolioValueData;
const updateTransactionHistory = require("./TransactionHistoryController").updateTransactionHistory;
const assetService = require("../services/AssetService");
const walletAddress = require("../services/WalletAddressService");
const axios = require("axios");


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

        const assets = await assetService.getAssetsWithMarketPrice(userId);

        
        if (!assets) {
            return res.status(404).json({ message: 'Assets not found' });
        }



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
            }
            else{
                const assetValue = asset.marketPrice *  totalBalance;
                portfolioValue += assetValue;
                updatedAsset.value = assetValue;
                updatedAsset.marketPrice = "$ " + asset.marketPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 10,});
            }

            if(wallet !== 'overview'){
                if(asset.symbol === 'USD'){
                    updatedAsset.marketPrice = "- - -";
                    updatedAsset.value = totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2,});;
                    updatedAsset.ROI = "- - -";
                    updatedAsset.RoiColor = '#FFFFFF';
                } else {
                    const currentMarketPrice = ( asset.marketPrice > 0 ) ? asset.marketPrice : asset.AvgPurchasePrice
                    const ROI = ( currentMarketPrice - asset.AvgPurchasePrice ) * ( 100 / asset.AvgPurchasePrice );
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

            return updatedAsset;
        })
        .filter(asset => Object.keys(asset).length > 0)
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
                    percentage: (!portfolioValue) ? 0 : (asset.value / portfolioValue) * 100
                }))

                .concat({ 
                    coinName: 'USD', 
                    percentage: (!portfolioValue) ? 0 : (usdBalance / portfolioValue) * 100   
                })

                .sort((a, b) => b.percentage - a.percentage);
        }


        res.status(200).json({
            usdBalance: usdBalance,
            portfolioValue: portfolioValue,
            assets: updatedAssets,
            ...(wallet === 'overview' ? 
            { 
                percentages: percentages, 
                historyData: await getPortfolioValueData(userId) 
            } : {
                walletAddress: await walletAddress.getWalletAddress(userId)
            })
        }); 
    }
    catch (error) {
        console.log("\nError getting PortfolioData:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}





const getBalance = async (req, res) => {
    try {
        if(!req.params.userId || !req.params.coin){
            return res.status(400).json({message: 'Invalid Request'}); 
        }

        const assets = await assetService.getAssets(req.params.userId, req.params.coin);


        if (!assets) {
            return !res? [] : res.status(404).json({message: 'Asset not found'}); 
        } 
        else {
            const data = assets.map(asset => ({
                symbol: asset.symbol,
                balance: asset.tradingBalance,
                avgPurchasePrice: asset.AvgPurchasePrice
            }))

            return !res? data : res.status(200).json(data);
        }
    } 
    catch (error) {
        console.log("\nError getting Asset balance:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}





const holdAsset = async (req, res) => {
    try{
        if( !req.body.userId || !req.body.coin || !req.body.quantity){
            return res.status(400).json({message: 'Incomplete Request Body'}); 
        }

        if(req.body.quantity <= 0){
            return res.status(400).json({message: "Invalid quantity"}); 
        }

        const assetToHold = ( await assetService.getAssets(req.body.userId, req.body.coin))[0];


        if (!assetToHold) {
            return res.status(404).json({message: 'Asset not found'}); 
        } 
        else{
            if(req.body.quantity > assetToHold.tradingBalance){
                return res.status(400).json({message: "Insufficient balance in trading wallet"}); 
            }

            else{
                assetToHold.tradingBalance -= req.body.quantity;
                assetToHold.holdingBalance += req.body.quantity;

                const savedAsset = await assetService.saveAsset(assetToHold);
                
                res.status(200).json({
                    coin: savedAsset.symbol,
                    balance: savedAsset.tradingBalance,
                    avgPurchasePrice: savedAsset.AvgPurchasePrice
                }); 
            }
        }
    }
    catch (error){
        console.log("\nError holding asset:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}





const executeTrade = async (req, res) => {
    try {
        if( 
            !req.body.userId || 
            !req.body.coin || 
            !req.body.quantity || 
            !req.body.price ||
            !req.body.category ||
            !req.body.type ||
            req.body.quantity < 0 ||
            req.body.price < 0 ||
            req.body.coin === 'USD' ||
            (req.body.category !== 'Market' && req.body.category !== 'Limit') ||
            (req.body.type !== 'Buy' && req.body.type !== 'Sell')
        ){  return res.status(400).json({ message:"invalid request body"}); }


        let assetToUpdate = ( await assetService.getAssets(req.body.userId, req.body.coin))[0];
        let usdAsset = ( await assetService.getAssets(req.body.userId, 'USD'))[0];


        if(!usdAsset){
            return res.status(400).json({message: 'Insufficient USD balance in trading wallet'});
        }

        
        if(req.body.type === 'Buy'){
            if(usdAsset.tradingBalance < (req.body.quantity * req.body.price)){
                return res.status(400).json({message: 'Insufficient USD balance in trading wallet'});
            }

            if(req.body.category === 'Market'){
                if (!assetToUpdate){
                    assetToUpdate = {
                        userId: req.body.userId,
                        symbol: req.body.coin,
                        AvgPurchasePrice: req.body.price,
                        tradingBalance: req.body.quantity
                    }
                } 
                else{
                    const oldTotalBalance = ( assetToUpdate.tradingBalance + assetToUpdate.holdingBalance + assetToUpdate.fundingBalance );
                    const newTotalBalance = ( oldTotalBalance + req.body.quantity );
                    const newPurchasePrice = ( assetToUpdate.AvgPurchasePrice * oldTotalBalance ) + ( req.body.price * req.body.quantity);
                    const newAvgPurchasePrice = ( newPurchasePrice / newTotalBalance );

                    assetToUpdate.AvgPurchasePrice = newAvgPurchasePrice;
                    assetToUpdate.tradingBalance += req.body.quantity;
                }

                usdAsset.tradingBalance -= (req.body.quantity * req.body.price);
            }

            else{
                usdAsset.tradingBalance -= (req.body.quantity * req.body.price);
                usdAsset.holdingBalance += (req.body.quantity * req.body.price);
            }
        }



        else{
            if (!assetToUpdate){
                return res.status(404).json({message: 'Asset not found'});
            }

            if(assetToUpdate.tradingBalance < req.body.quantity){
                return res.status(400).json({message: 'Insufficient balance in trading wallet'});
            }

            if(req.body.category === 'Market'){
                assetToUpdate.tradingBalance -= req.body.quantity;
                usdAsset.tradingBalance += (req.body.quantity * req.body.price);
            }

            else{
                assetToUpdate.tradingBalance -= req.body.quantity;
                assetToUpdate.holdingBalance += req.body.quantity;
            }         
        }


        await assetService.saveAsset(assetToUpdate);
        await assetService.saveAsset(usdAsset);

        res.status(200).json(
            await getBalance({params:{userId: req.body.userId, coin: `${req.body.coin},USD`}}, null)
        );  
    } 
    
    catch (error) {
        console.log("\nError adding asset:", error);
        res.status(500).json({message: error.message});
    }
};




const allocateUSD = async (req, res) => {
    try {
        if( !req.body.userId || !req.body.quantity || req.body.quantity <= 0){
            return res.status(400).json({message: 'Invalid Request Body'});
        }

        await walletAddress.generateWalletAddress(req, null);

        await assetService.saveAsset({
            userId: req.body.userId,
            symbol: 'USD',
            AvgPurchasePrice: 1,
            fundingBalance: req.body.quantity
        });

        res.status(200).json({ message: "USD allocated successfully"});
    }

    catch (error) {
        console.log("\nError allocating USD", error);
        res.status(500).json({message: error.message});
    }
}





const receiveFromEx = async (req, res) => {
    try {
        if( 
            !req.body.receivingWallet || 
            !req.body.sendingWallet || 
            !req.body.coin || 
            !req.body.quantity ||
            req.body.quantity < 0 ||
            !req.body.AvgPurchasePrice ||
            !req.body.type 
        ){  return res.status(400).json({ message:"invalid request body"}); }

        req.body.AvgPurchasePrice = (req.body.coin === 'USD') ? 1 : req.body.AvgPurchasePrice;

        const userId = await walletAddress.getUserId(req.body.receivingWallet);

        if(!userId){ return res.status(400).json({message: 'Invalid receiving wallet'}); }

        let assetToUpdate = ( await assetService.getAssets(userId, req.body.coin))[0];

        if (!assetToUpdate){
            assetToUpdate = {
                userId: userId,
                symbol: req.body.coin,
                fundingBalance: req.body.quantity,
                AvgPurchasePrice: req.body.AvgPurchasePrice
            }
        }

        else{
            const oldTotalBalance = ( assetToUpdate.tradingBalance + assetToUpdate.holdingBalance + assetToUpdate.fundingBalance );
            const newTotalBalance = ( oldTotalBalance + req.body.quantity );
            const newPurchasePrice = ( assetToUpdate.AvgPurchasePrice * oldTotalBalance ) + ( req.body.AvgPurchasePrice * req.body.quantity);
            const newAvgPurchasePrice = ( newPurchasePrice / newTotalBalance );

            assetToUpdate.AvgPurchasePrice = newAvgPurchasePrice;
            assetToUpdate.fundingBalance += req.body.quantity;
        }

        await assetService.saveAsset(assetToUpdate);

        await updateTransactionHistory({
            userId: userId,
            coin: req.body.coin,
            quantity: req.body.quantity,
            sendingWallet: req.body.sendingWallet,
            receivingWallet: 'fundingWallet',
        });
        
        res.status(200).json({message: "Asset Updated"}); 
    } 
    
    catch (error) {
        console.log("\nError adding asset:", error);
        res.status(500).json({message: error.message});
    }
};





const deductAsset = async (req, res) => {
    try{
        if( req.params.source !== 'trading' && req.params.source !== 'holding'){
            return res.status(400).json({message: 'Deduction Source not Provided (trading || holding)'});
        }


        if( !req.body.userId || !req.body.coin || !req.body.quantity){
            return res.status(400).json({message: 'Incomplete Request Body'}); 
        }


        const assetToDeduct = ( await assetService.getAssets(req.body.userId, req.body.coin))[0];
 


        if (!assetToDeduct) {
            return res.status(404).json({message: 'Asset not found'});
        }   
        else{
            const deductionSource = `${req.params.source}Balance`;

            if(req.body.quantity <= 0){
                return res.status(400).json({message: "Invalid quantity"});
            }

            else if(req.body.quantity > assetToDeduct[deductionSource] ){
                return res.status(400).json({message: `Insufficient balance in ${deductionSource}`});
            }

            else{
                assetToDeduct[deductionSource] -= req.body.quantity;

                const updatedAsset = await assetService.saveAsset(assetToDeduct);

                res.status(200).json({
                    coin: updatedAsset.symbol,
                    balance: updatedAsset.tradingBalance,
                    avgPurchasePrice: updatedAsset.AvgPurchasePrice
                }); 
            }
        }
    }
    catch (error){
        console.log("\nError Deducting asset:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}





const transferAsset = async (req, res) => {
    try {
        if( 
            !req.body.userId || 
            !req.body.coin || 
            !req.body.quantity || 
            !req.body.sendingWallet || 
            !req.body.receivingWallet
        ){ return res.status(400).json({message: 'Incomplete Request Body'}); }


        const assetToTransfer = ( await assetService.getAssets(req.body.userId, req.body.coin))[0];


        if (!assetToTransfer) {
            return res.status(404).json({message: 'Asset not found'});
        } 

        else {
            const senderBalance = req.body.sendingWallet.slice(0, 7).concat("Balance");
            const receiverBalance = req.body.receivingWallet.slice(0, 7).concat("Balance");

            if(req.body.quantity <= 0){
                return res.status(400).json({message: "Invalid quantity"});
            }

            else if(req.body.quantity > assetToTransfer[senderBalance]){
                return res.status(400).json({message: "Insufficient balance in sending wallet"});
            }

            else{
                if(req.body.receivingWallet === 'tradingWallet' || req.body.receivingWallet === 'fundingWallet'){
                    assetToTransfer[receiverBalance]  += req.body.quantity;
                    assetToTransfer[senderBalance] -= req.body.quantity;
                }

                else{
                    await axios.post(
                        "http://localhost:8006/wallet",
                        {
                            userId: assetToTransfer.userId ,
                            coin: assetToTransfer.symbol ,
                            quantity: req.body.quantity ,
                            purchasePrice: assetToTransfer.AvgPurchasePrice ,
                        }
                    )
                    .then(async(res) => {
                        assetToTransfer[senderBalance] -= req.body.quantity;
                    })
                    .catch((error) => {
                        res.status(500).json({message: "Transfer failed."});
                        console.log("\nError transferring asset:", error);
                    });
                }
                
                await assetService.saveAsset(assetToTransfer);
                await updateTransactionHistory(req.body);
            }
            
            req.body.sendingWallet === 'tradingWallet' ? 
            await getPortfolioData({ ...req, params: { ...req.params, wallet: "trading" } }, res) : 
            await getPortfolioData({ ...req, params: { ...req.params, wallet: "funding" } }, res);
        }
    } 
    
    catch (error) {
        console.log("\nError updating asset:", error);
        res.status(error.status || 500).json({message: error.message});
    }
};






module.exports = {
    getPortfolioData,
    getBalance,
    holdAsset,
    executeTrade,
    allocateUSD,
    receiveFromEx,
    deductAsset,
    transferAsset
};