const dataSource = require("../config/config");
const assetRepo = dataSource.getRepository("Asset");
const getPortfolioValueData = require("./PortfolioValueController").getPortfolioValueData;

const getAllAssets = async (req, res) => {
    const wallet = req.params.wallet;
    try {
        if (!req.query.userId) {
            res.status(404).json({ message: 'User Id not found' });
        } 
        
        else {
            const assets = await assetRepo.find({
                where: {
                    userId: req.query.userId,
                },
            });

            let updatedAssets = {
                historyData : await getPortfolioValueData(req, null)
            } 


            switch (wallet){
                case 'overview' :
                    updatedAssets = {...updatedAssets, ...getOverviewAssets(assets)};
                    break;
                case 'trading' :
                    updatedAssets = {...updatedAssets, ...getTradingAssets(assets)};
                    break;
                case 'funding' :
                    updatedAssets = {...updatedAssets, ...getFundingAssets(assets)};
                    break;
                default :
                    updatedAssets = assets;
            }

            res.status(200).json(updatedAssets);
        }
    }
    
    catch (error) {
        console.log("\nError fetching assets:", error);
        res.status(500).json({ message: error.message });
    }
};


const getOverviewAssets = (assets) => {
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

    return({
        usdBalance: usdBalance,
        portfolioValue: portfolioValue,
        assets: updatedAssets,
        percentages: percentages
    });

}

const getTradingAssets = (assets) => {
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
                value: `$ ${totalBalance.toFixed(2)}`,
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
            value: `$ ${(totalBalance * marketPrice).toFixed(2)}`,
            ROI: `${ROI.toFixed(2)} %`,
            RoiColor: ( ROI > 0 ) ? '#21DB9A' : ( ROI < 0 ) ? '#FF0000' : '#FFFFFF'
        };
    
        return [...accumulator, updatedAsset];
    }, []);

    updatedAssets.sort((a, b) => b.value - a.value);

    return({
        usdBalance: usdBalance,
        portfolioValue: portfolioValue,
        assets: [
            usdAssetData,
            ...updatedAssets
        ]
    });

}

const getFundingAssets = (assets) => {
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
            value: `$ ${(asset.fundingBalance * marketPrice).toFixed(2)}`,
            ROI: `${ROI.toFixed(2)} %`,
            RoiColor: ( ROI > 0 ) ? '#21DB9A' : ( ROI < 0 ) ? '#FF0000' : '#FFFFFF'
        };
    
        return [...accumulator, updatedAsset];
    }, []);

    updatedAssets.sort((a, b) => b.value - a.value);

    return({
        usdBalance: usdBalance,
        portfolioValue: portfolioValue,
        assets: [
            {   
                symbol: 'USD',
                fundingBalance: usdBalance,
            },
            ...updatedAssets
        ]
    });

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



const updateAsset = async (req, res) => {
    try {
        // const assetToUpdate = await assetRepo.findOne({
        //     where: {
        //         assetId: req.query.assetId,
        //     },
        // })

        // if (!assetToUpdate) {
        //     res.status(404).json({message: 'Asset not found'});
        // } 
        
        // else {
        //     assetRepo.merge(assetToUpdate, req.body);
        //     await assetRepo.save(assetToUpdate);

        //     const updatedAssets = await getAllAssets({ 
        //         query: { 
        //             userId: req.body.userId,
        //         }
        //     }, res );

        //     res.status(200).json(updatedAssets);
        // }


        res.status(200).json(req.body);
    } 
    
    catch (error) {
        console.log("\nError updating asset:", error);
        res.status(500).json({message: error.message});
    }
};



const deleteAsset = async (req, res) => {
    try {
        const assetToDelete = await assetRepo.findOne({
            where: {
                assetId: req.query.assetId,
            },
        })

        if (!assetToDelete) {
            res.status(404).json({message: 'Asset not found'});
        } 
        
        else {
            await assetRepo.remove(assetToDelete);

            const updatedAssets = await getAllAssets({ 
                query: { 
                    userId: req.query.userId,
                }
            }, res );

            res.status(200).json(updatedAssets);
        }
    } 
    
    catch (error) {
        console.log("\nError deleting asset:", error);
        res.status(500).json({message: error.message});
    }
};


module.exports = {
    getAllAssets,
    addAsset,
    updateAsset,
    deleteAsset
};