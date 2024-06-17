const dataSource = require("../config/config");
const WalletHistoryRepo = dataSource.getRepository("WalletHistory");

const getWalletHistory = async (req, res) => {

    
    try {
        if (!req.query.userId) {
            res.status(404).json({ message: 'User Id not found' });
        } 
        
        else {
            const WalletHistoryData = await WalletHistoryRepo.find({
                where: {
                    userId: req.query.userId,
                },
                order: {
                    historyId: 'DESC',
                },
            });

           
            res.status(200).json(WalletHistoryData);
        }
    }
    
    catch (error) {
        console.log("\nError fetching transaction history:", error);
        res.status(500).json({ message: error.message });
    }
}

const updateWalletHistory = async (historyData) => {
    console.log(historyData)
    await WalletHistoryRepo.save(historyData);
    return;
}


module.exports = {
    getWalletHistory,
    updateWalletHistory,
};
