const dataSource = require("../config/config");
const TransactionHistoryRepo = dataSource.getRepository("TransactionHistory");

const getTransactionHistory = async (req, res) => {
    try {
        if (!req.query.userId) {
            res.status(404).json({ message: 'User Id not found' });
        } 
        
        else {
            const transactionHistoryData = await TransactionHistoryRepo.find({
                where: {
                    userId: req.query.userId,
                },
                order: {
                    historyId: 'DESC',
                },
            });

            transactionHistoryData.map((data) => {
                data.sendingWallet = data.sendingWallet === 'tradingWallet' ? 'Trading Wallet' : data.sendingWallet === 'fundingWallet' ? 'Funding Wallet' : data.sendingWallet;
                data.receivingWallet = data.receivingWallet === 'tradingWallet' ? 'Trading Wallet' : data.receivingWallet === 'fundingWallet' ? 'Funding Wallet' : data.receivingWallet;
            });

            res.status(200).json(transactionHistoryData);
        }
    }
    
    catch (error) {
        console.log("\nError fetching transaction history:", error);
        res.status(500).json({ message: error.message });
    }
}

const updateTransactionHistory = async (historyData) => {
    await TransactionHistoryRepo.save(historyData);
    return;
}

module.exports = {
    getTransactionHistory,
    updateTransactionHistory,
};
