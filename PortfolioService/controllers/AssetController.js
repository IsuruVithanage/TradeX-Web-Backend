const axios = require("axios");
const dataSource = require("../config/config");
const assetRepo = dataSource.getRepository("Asset");
const getPortfolioValueData = require("./PortfolioValueController").getPortfolioValueData;
const updateTransactionHistory = require("./TransactionHistoryController").updateTransactionHistory;

const getAllAssets = async (userId) => {
    try {
        if (!userId) {
            throw { 
                status: 404,
                message: 'User Id not found' 
            };
        } 
        
        else {
            const assets = await assetRepo.find({
                where: {
                    userId: userId,
                },
            });

            return assets;
        }
    }
    
    catch (error) {
        throw  {
            status: error.status || 500,
            message: error.message || 'Internal Server Error'
        };
    }
}




const getOverviewAssets = async (req, res) => {
    try {
        const assets = await getAllAssets(req.query.userId);
        let portfolioValue = 0;
        let usdBalance = 0;

        const updatedAssets = assets.reduce((accumulator, asset) => {
            const totalBalance = asset.tradingBalance + asset.holdingBalance + asset.fundingBalance;

            if (asset.symbol === 'USD') {
                usdBalance = totalBalance;
                portfolioValue += totalBalance;
                return accumulator;
            }
        
            const marketPrice = 1000;
            portfolioValue += ( totalBalance * marketPrice );
        
            const updatedAsset = {
                symbol: asset.symbol,
                tradingBalance: asset.tradingBalance + asset.holdingBalance,
                fundingBalance: asset.fundingBalance,
                totalBalance: totalBalance,
                marketPrice: `$ ${marketPrice.toFixed(2)}`,
                value: (totalBalance * marketPrice)
            };
        
            return [...accumulator, updatedAsset];
        }, []);


        const percentages = updatedAssets.map(asset => ({
            coinName: asset.symbol,
            percentage: (asset.value / portfolioValue) * 100
        })).concat({ 
            coinName: 'USD', 
            percentage: (usdBalance / portfolioValue) * 100   
        });


        updatedAssets.sort((a, b) => b.value - a.value);
        percentages.sort((a, b) => b.percentage - a.percentage);

        res.status(200).json({
            usdBalance: usdBalance,
            portfolioValue: portfolioValue,
            assets: updatedAssets,
            percentages: percentages,
            historyData : await getPortfolioValueData(req, null)
        });
    }
    
    catch (error) {
        console.log("\nError getting overview assets:", error);
        res.status(error.status || 500).json({ message: error.message });
    }
}



const getTradingAssets = async (req, res) => {
    try {
        const assets = await getAllAssets(req.query.userId);
        let portfolioValue = 0;
        let usdBalance = 0;
        let usdAssetData = {};

        const updatedAssets = assets.reduce((accumulator, asset) => {
            const totalBalance = asset.tradingBalance + asset.holdingBalance;

            if (asset.symbol === 'USD') {
                usdBalance = totalBalance;
                portfolioValue += totalBalance;
                usdAssetData = {
                    symbol: asset.symbol,
                    tradingBalance: asset.tradingBalance,
                    holdingBalance: asset.holdingBalance,
                    marketPrice: "- - -",
                    value: totalBalance,
                    ROI: "- - -",
                    RoiColor: '#FFFFFF'
                }
                return accumulator;
            }
        
            const marketPrice = 1000;
            const ROI = ( marketPrice - asset.AvgPurchasePrice ) * ( 100 / asset.AvgPurchasePrice )
            portfolioValue += ( totalBalance * marketPrice );
        
            const updatedAsset = {
                symbol: asset.symbol,
                tradingBalance: asset.tradingBalance,
                holdingBalance: asset.holdingBalance,
                marketPrice: `$ ${marketPrice.toFixed(2)}`,
                value: totalBalance * marketPrice,
                ROI: `${ROI.toFixed(2)} %`,
                RoiColor: ( ROI > 0 ) ? '#21DB9A' : ( ROI < 0 ) ? '#FF0000' : '#FFFFFF'
            };
        
            return [...accumulator, updatedAsset];
        }, []);

        updatedAssets.sort((a, b) => b.value - a.value);

        res.status(200).json({
            usdBalance: usdBalance,
            portfolioValue: portfolioValue,
            assets: [
                usdAssetData,
                ...updatedAssets
            ]
        });
    }

    catch (error) {
        console.log("\nError getting trading assets:", error);
        res.status(error.status || 500).json({ message: error.message });
    }
}



const getFundingAssets = async (req, res) => {
    try {
        const assets = await getAllAssets(req.query.userId);
        let portfolioValue = 0;
        let usdBalance = 0;

        const updatedAssets = assets.reduce((accumulator, asset) => {
            if (asset.symbol === 'USD') {
                usdBalance = asset.fundingBalance;
                portfolioValue += asset.fundingBalance;
                return accumulator;
            }
        
            const marketPrice = 1000;
            const ROI = ( marketPrice - asset.AvgPurchasePrice ) * ( 100 / asset.AvgPurchasePrice )
            portfolioValue += ( asset.fundingBalance * marketPrice );
        
            const updatedAsset = {
                symbol: asset.symbol,
                fundingBalance: asset.fundingBalance,
                marketPrice: `$ ${marketPrice.toFixed(2)}`,
                value: asset.fundingBalance * marketPrice,
                ROI: `${ROI.toFixed(2)} %`,
                RoiColor: ( ROI > 0 ) ? '#21DB9A' : ( ROI < 0 ) ? '#FF0000' : '#FFFFFF'
            };
        
            return [...accumulator, updatedAsset];
        }, []);

        updatedAssets.sort((a, b) => b.value - a.value);

        res.status(200).json({
            usdBalance: usdBalance,
            portfolioValue: portfolioValue,
            assets: [
                {   
                    symbol: 'USD',
                    fundingBalance: usdBalance,
                    value: usdBalance,
                },
                ...updatedAssets
            ]
        });
    }

    catch (error) {
        console.log("\nError getting funding assets:", error);
        res.status(error.status || 500).json({ message: error.message });
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
                await getTradingAssets(req, res) : 
                await getFundingAssets(req, res);
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
        res.status(500).json({message: error.message});
    }
};


module.exports = {
    getOverviewAssets,
    getTradingAssets,
    getFundingAssets,
    addAsset,
    tranferAsset,
    CheckAssetForDelete
};