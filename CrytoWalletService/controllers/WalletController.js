// Import required modules
const axios = require("axios");
const dataSource = require("../config/config");
const walletRepo = dataSource.getRepository("Capital");
const updateWalletHistory = require("./WalletHistoryContrller").updateWalletHistory;

// Function to get all balances for a user
const getAllBalances = async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;	
        let usdBalance = 0;
        let portfolioValue = 0;

        // Check if userId is provided
        if (!userId) {
            return res.status(404).json({ message: 'User Id not found' });
        } 

        // Retrieve assets for the user
        const assets = await walletRepo.find({
            where: {
                userId: userId,
            },
        });

        // Fetch market prices for the assets
        await axios.get(
            'https://api.binance.com/api/v3/ticker/price?symbols=' + 
            "[\"" + assets
            .filter(asset => asset.coin !== 'USD')
            .map(asset => `${asset.coin}USDT`)
            .join('\",\"') + "\"]"
        ).then((response) => {
            assets.map(asset => {
                if (asset.coin !== 'USD') {
                    const marketPrice = response.data.find(data => data.symbol === asset.coin + 'USDT');
                    asset.marketPrice = (marketPrice) ? parseFloat(marketPrice.price) : 0;
                }
            });
        }).catch((error) => {
            console.log("\nError getting market prices:", error.message);
            assets.map(asset => {
                if (asset.coin !== 'USD') {
                    asset.marketPrice = 0;
                }
            });
        });

        // Process and update asset data
        let updatedAssets = assets.map(asset => {
            let updatedAsset = {};
            updatedAsset.coin = asset.coin;
            updatedAsset.balance = asset.balance;

            // Calculate portfolio value and USD balance
            if (asset.coin === 'USD') {
                usdBalance = asset.balance;
                portfolioValue += asset.balance;
            } else {
                updatedAsset.marketPrice = `$ ${asset.marketPrice}`;
                updatedAsset.value = ((asset.marketPrice > 0) ? asset.marketPrice : 1) * asset.balance;
                portfolioValue += updatedAsset.value;

                const ROI = (asset.marketPrice - asset.AvgPurchasePrice) * (100 / asset.AvgPurchasePrice);
                updatedAsset.ROI = `${ROI.toFixed(2)} %`;
                updatedAsset.RoiColor = (ROI > 0) ? '#21DB9A' : (ROI < 0) ? '#FF0000' : '#FFFFFF';
            }

            return updatedAsset;
        }).filter(asset => Object.keys(asset).length > 0).sort((a, b) => b.value - a.value);

        // Move USD asset to the top of the list
        updatedAssets = [ 
            updatedAssets.find(asset => asset.coin === 'USD'), 
            ...updatedAssets.filter(asset => asset.coin !== 'USD') 
        ];

        // Return response with portfolio data
        res.status(200).json({
            usdBalance: usdBalance,
            portfolioValue: portfolioValue,
            assets: updatedAssets,
        }); 
    } catch (error) {
        console.log("\nError getting PortfolioData:", error);
        res.status(error.status || 500).json({message: error.message});
    }
};

// Function to transfer balance between wallets
const transferBalance = async (req, res) => {
    try {
        // Validate request parameters
        if (!req.body.userId || !req.body.coin || !req.body.quantity || !req.body.sendingWallet || !req.body.receivingWallet) {
            return res.status(400).json({
                message: "Invalid request, contain null values for 'userId', 'coin', 'quantity'"
            });
        }
        if (req.body.quantity <= 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }
      
        // Find the asset to transfer
        let assetToTransfer = await walletRepo.findOne({
            where: {
                userId: req.body.userId,
                coin: req.body.coin
            },
        });
        
        // Handle asset not found
        if (!assetToTransfer) {
            return res.status(400).json({ message: "Assets not found" });
        }
        // Check for insufficient balance
        if (req.body.quantity > assetToTransfer.balance) {
            return res.status(400).json({ message: "Insufficient balance in sending wallet" });
        }

        // Transfer asset
        axios.post("http://localhost:8011/portfolio/asset/transfer", {
            receivingWallet: req.body.receivingWallet,
            sendingWallet: req.body.sendingWallet,
            coin: assetToTransfer.coin,
            quantity: req.body.quantity,
            AvgPurchasePrice: assetToTransfer.AvgPurchasePrice,
        }).then(async() => {
            assetToTransfer.balance -= req.body.quantity;
            await walletRepo.save(assetToTransfer)
            await updateWalletHistory({
                userId:req.body.userId,
                coin:req.body.coin,
                quantity:req.body.quantity,
                date:new Date(),
                type:"Send",
                from_to: req.body.receivingWallet
            })
            await getAllBalances({ ...req, params: { ...req.params, userId: req.body.userId } }, res);

        }).catch((error) => {
            console.log("\nError transferring asset:", error);
            res.status(500).json({ message: "Transfer failed: Error transferring asset" });
        });
    } catch (error) {
        console.log("\nError transferring asset:", error);
        res.status(500).json({ message: "Transfer failed: " + error.message });
    }
};

// Function to add capital to the wallet
const addCapital = async (req, res) => {
    try {
        // Validate request parameters
        if (!req.body.userId || !req.body.coin || !req.body.quantity || !req.body.purchasePrice ){
            return res.status(400).json({ 
                message:"invalid request, contain null values for 'userId', 'coin', 'quantity' or 'purchasePrice'"
            });
        }
        if (req.body.quantity <= 0 || req.body.purchasePrice <= 0){
            return res.status(400).json({ message:"invalid quantity or purchasePrice" });
        }

        // Set purchase price to 1 for USD
        req.body.purchasePrice = (req.body.coin === 'USD') ? 1 : req.body.purchasePrice;

        // Find existing asset or create new one
        let assetToUpdate = await walletRepo.findOne({
            where:{
                userId:req.body.userId,
                coin:req.body.coin
            }
        })

        // Update asset details
        if (!assetToUpdate){
            assetToUpdate = {
                userId: req.body.userId,
                coin: req.body.coin,
                balance: req.body.quantity,
                AvgPurchasePrice: req.body.purchasePrice
            }
        } else {
            const newTotalBalance = (assetToUpdate.balance + req.body.quantity);
            const newPurchasePrice = (assetToUpdate.AvgPurchasePrice * assetToUpdate.balance  ) + (req.body.purchasePrice * req.body.quantity);
            const newAvgPurchasePrice = (newPurchasePrice / newTotalBalance);

            assetToUpdate.AvgPurchasePrice = newAvgPurchasePrice;
            assetToUpdate.balance += req.body.quantity;
        }

        // Save updated asset details
        await walletRepo.save(assetToUpdate)
        await updateWalletHistory({
            userId:req.body.userId,
            coin:req.body.coin,
            quantity:req.body.quantity,
            date:new Date(),
            type:"Recieve",
            from_to: "tradeX"
        })
        res.status(200).json({message: "Asset Updated"}); 
    } catch (error) {
        console.log("\nError adding asset:", error);
        res.status(500).json({message: error.message});
    }
};

// Export controller functions
module.exports = {
    transferBalance,
    getAllBalances,
    addCapital
}
