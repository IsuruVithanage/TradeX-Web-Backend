const axios = require("axios");
const dataSource = require("../config/config");
const walletRepo = dataSource.getRepository("Capital");


const getAllBalances = async (req, res) => {
    try {
        const userId = req.params.userId;	
        let usdBalance = 0;
        let portfolioValue = 0;


        if (!userId) {
            return res.status(404).json({ message: 'User Id not found' });
        } 

        const assets = await walletRepo.find({
            where: {
                userId: userId,
            },
        });
        

        await axios
            .get(
                'https://api.binance.com/api/v3/ticker/price?symbols=' + 
                "[\"" + assets
                .filter(asset => asset.coin !== 'USD')
                .map(asset => `${asset.coin}USDT`)
                .join('\",\"') + "\"]"
            )

        

            .then((res) => {
                assets.map(asset => {
                    if (asset.coin !== 'USD') {
                        const marketPrice = res.data.find(data => data.symbol === asset.coin + 'USDT');
                        asset.marketPrice = (marketPrice) ? parseFloat(marketPrice.price): 0;
                    }
                });
            })

            .catch((error) => {
                console.log("\nError getting markrt prices:", error.message);

                assets.map(asset => {
                    if (asset.coin !== 'USD') {
                        asset.marketPrice = 0;
                    }
                });
            });


        let updatedAssets = assets.map(asset => {
            let updatedAsset = {};


            updatedAsset.coin = asset.coin;
            updatedAsset.balance = asset.balance;


            if (asset.coin === 'USD') {
                usdBalance = asset.balance;
                portfolioValue += asset.balance;
            }
            else{
                updatedAsset.marketPrice = `$ ${asset.marketPrice}`;
                updatedAsset.value = ((asset.marketPrice > 0) ? asset.marketPrice : 1) *  asset.balance;;
                portfolioValue += updatedAsset.value;

                const ROI = ( asset.marketPrice - asset.AvgPurchasePrice ) * ( 100 / asset.AvgPurchasePrice );
                updatedAsset.ROI = `${ROI.toFixed(2)} %`;
                updatedAsset.RoiColor = ( ROI > 0 ) ? '#21DB9A' : ( ROI < 0 ) ? '#FF0000' : '#FFFFFF';
            }


            
            return updatedAsset;
        })
        .filter(asset => Object.keys(asset).length > 0)
        .sort((a, b) => b.value - a.value);




        updatedAssets = [ 
            updatedAssets.find(asset => asset.coin === 'USD'), 
            ...updatedAssets.filter(asset => asset.coin !== 'USD') 
        ];



        res.status(200).json({
            usdBalance: usdBalance,
            portfolioValue: portfolioValue,
            assets: updatedAssets,
        }); 
    }
    catch (error) {
        console.log("\nError getting PortfolioData:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}


const getAllUsers = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    res.json(await userRepo.find());
};

const saveUser = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const usersave = userRepo.save(req.body);
    res.json(usersave);
};


const deleteUser = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const userId = req.params.id;

    try {
        const userToDelete = await userRepo.findOne({
            where: {
                userId: userId,
            },
        })

        if (!userToDelete) {
            return res.status(404).json({message: 'User not found'});
        }

        await userRepo.remove(userToDelete);
        res.json({message: 'User deleted successfully'});
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};


module.exports = {
    getAllUsers,
    saveUser,
    deleteUser,
    getAllBalances
}