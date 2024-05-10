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
        const uniqueUsers = [];
        const uniqueCoins = [];
        const groupedAssets = {};

        const allAssets =  await assetRepo
            .createQueryBuilder("asset")
            .select(["asset.userId", "asset.symbol"])
            .addSelect("SUM(asset.tradingBalance + asset.holdingBalance + asset.fundingBalance)", "totalValue")
            .groupBy(["asset.userId", "asset.symbol"])
            .orderBy("asset.userId", "ASC")
            .getRawMany();


        allAssets.forEach(asset => {
            const { asset_userId: userId, asset_symbol: symbol, totalValue } = asset;

            if (!uniqueUsers.includes(userId)) {
                uniqueUsers.push(userId);
                groupedAssets[userId] = [];
            }

            if (symbol !== 'USD' && !uniqueCoins.includes(symbol + 'USDT')) {
                uniqueCoins.push(symbol + 'USDT');
            }

            groupedAssets[userId].push({ symbol, totalValue });

        });


        const marketPrices = await axios
            .get('https://api.binance.com/api/v3/ticker/price?symbols=' + 
             encodeURIComponent(JSON.stringify(uniqueCoins)))
            .then((res) => res.data)
            .catch((error) => {
                console.log("\nError getting market prices:", error.message);
                return [];
            });


        const groupedValues = Object.keys(groupedAssets).map(userId => {
            const value = groupedAssets[userId].reduce((acc, asset) => {
                const marketPrice = marketPrices.find(data => data.symbol === asset.symbol + 'USDT');
                const price = !marketPrice ? 1 : parseFloat(marketPrice.price);
                return acc + asset.totalValue * price;
            }, 0);

            return { userId: Number(userId), value: value };
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
            encodeURIComponent(JSON.stringify(assets
                .filter(asset => asset.symbol !== 'USD')
                .map(asset => asset.symbol + 'USDT')
            ))
        )

        .then((res) => {
            assets.map(asset => {
                const marketPrice = res.data.find(data => data.symbol === asset.symbol + 'USDT');
                asset.marketPrice = (!marketPrice) ? 1 : parseFloat(marketPrice.price);
            });
        })

        .catch((error) => {
            console.log("\nError getting market prices:", error.message);
            assets.map(asset => { asset.marketPrice = (asset.symbol !== 'USD') ? 0 : 1; });
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