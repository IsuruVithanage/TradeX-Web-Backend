const axios = require("axios");
const dataSource = require("../config/config");
const assetRepo = dataSource.getRepository("Asset");


const getAssets = async (userId, coins) => {
    try {
        let condition = {userId: userId};

        if(coins !== undefined && coins){
            condition = coins.split(',').map(coin => ({
                userId: userId, 
                symbol: coin
            }));
        }

        const assets = await assetRepo.find({
            where: condition
        });

        return assets;
    }

    catch (error) {
        console.log("\nError getting balance:", error);
        return null;
    }
}





const getRealtimeTotalValues = async () => {
    try{
        const allAssets =  await assetRepo
            .createQueryBuilder("asset")
            .select(["asset.userId", "asset.symbol"])
            .addSelect("SUM(asset.tradingBalance + asset.holdingBalance + asset.fundingBalance)", "totalValue")
            .groupBy(["asset.userId", "asset.symbol"])
            .orderBy("asset.userId", "ASC")
            .getRawMany();


        const coins = [...new Set(allAssets.filter(asset => asset.asset_symbol !== 'USD').map(asset => asset.asset_symbol + "USDT"))];
        const users = [...new Set(allAssets.map(asset => asset.asset_userId))];


        const marketPrices = await axios
            .get('https://api.binance.com/api/v3/ticker/price?symbols=' + "[\"" + coins.join('\",\"') + "\"]")
            .then((res) => res.data)
            .catch((error) => {
                console.log("\nError getting market prices:", error.message);
                return [];
            });


        const groupedValues = users.map(user => {
            let value = 0;

            allAssets.filter(asset => asset.asset_userId === user).map(asset => {
                const marketPrice = marketPrices.find(data => data.symbol === asset.asset_symbol + 'USDT');
                asset.asset_symbol === 'USD'    ?
                value += asset.totalValue       : 
                value += asset.totalValue * ((marketPrice) ? parseFloat(marketPrice.price): 1);

            });

            return { userId: user, value: value };
        });

            return groupedValues;
    }
    
    catch (error) {
        console.log("\nError getting realtime total values:", error);
        return [];
    }
}





const getAssetsWithMarketPrice = async (userId, coins) => {
    try {
        const assets = await getAssets(userId, coins);
      
        if (assets.length === 0){
            return [];
        } 

        else if(assets.length === 1 && assets[0].symbol === 'USD') {
            assets[0].marketPrice = 1;
            return assets;
        }

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
                }else{
                    asset.marketPrice = 1;
                }
            });
        })

        .catch((error) => {
            console.log("\nError getting market prices:", error.message);

            assets.map(asset => {
                if (asset.symbol !== 'USD') {
                    asset.marketPrice = 0;
                }else{
                    asset.marketPrice = 1;
                }
            });
        });

        return assets;
    }

    catch (error) {
        console.log("\nError getting market price:", error);
        return null;
    }
}





const saveAsset = async (asset) => {
    try {
        const savedAsset = await assetRepo.save(asset);
        return savedAsset;
    }

    catch (error) {
        console.log("\nError saving asset:", error);
        return null;
    }
}


module.exports = {
    getAssets,
    getRealtimeTotalValues,
    getAssetsWithMarketPrice,
    saveAsset
};