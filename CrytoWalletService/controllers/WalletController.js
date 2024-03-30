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



// wallet to wallet crypto transfer

const transferBalance = async (req, res) => {
    try {
        if (!req.body.userId || !req.body.coin || !req.body.quantity || !req.body.sendingWallet || !req.body.receivingWallet) {
            return res.status(400).json({
                message: "Invalid request, contain null values for 'userId', 'coin', 'quantity'"
            });
        }

        if (req.body.quantity <= 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

      
        let assetToTransfer = await walletRepo.findOne({
            where: {
                userId: req.body.userId,
                coin: req.body.coin
            },
        });

        if (!assetToTransfer) {
            return res.status(400).json({ message: "Assets not found" });
        }

        if (req.body.quantity > assetToTransfer.balance) {
            return res.status(400).json({ message: "Insufficient balance in sending wallet" });
        }

        // Transfer asset
        axios.post("http://localhost:8011/portfolio/asset/transfer", {
            userId: assetToTransfer.userId,
            coin: assetToTransfer.coin,
            quantity: req.body.quantity,
            purchasePrice: assetToTransfer.AvgPurchasePrice,
        }).then(() => {
            // Update balance
            assetToTransfer.balance -= req.body.quantity;
            // Save updated asset
            walletRepo.save(assetToTransfer).then(() => {
                // Send response
                res.status(200).json({ message: "Transfer successful" });
            }).catch((error) => {
                console.log("\nError saving asset:", error);
                res.status(500).json({ message: "Transfer failed: Error saving asset" });
            });
        }).catch((error) => {
            console.log("\nError transferring asset:", error);
            res.status(500).json({ message: "Transfer failed: Error transferring asset" });
        });
    } catch (error) {
        console.log("\nError transferring asset:", error);
        res.status(500).json({ message: "Transfer failed: " + error.message });
    }
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
    transferBalance,
    deleteUser,
    getAllBalances
}