const CryptoJS = require("crypto-js");
const dataSource = require("../config/config");
const TransactionHistoryRepo = dataSource.getRepository("TransactionHistory");

const getTransactionHistory = async (req, res) => {
    try {
        const timezoneOffset = !req.query.timezoneOffset ? 0 : req.query.timezoneOffset;

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

            transactionHistoryData.forEach((historyData) => {
                const date = new Date(historyData.date.getTime() - (timezoneOffset * 60 * 1000));

                historyData.date = 
                    String(date.getUTCDate()).padStart(2,'0') + 
                    '-' + String(date.getUTCMonth()+1).padStart(2,'0') + 
                    '-' + date.getUTCFullYear();
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
    const secretKey = "portfolioUser@TradeX";
    console.log("receivingWallet", historyData.receivingWallet);
    switch (historyData.receivingWallet){
        case 'fundingWallet':
            historyData.receivingWallet = 'Funding Wallet';
            break;

        case 'tradingWallet':
            historyData.receivingWallet = 'Trading Wallet';
            break;

        default:
            try{ historyData.receivingWallet = CryptoJS.AES
                .decrypt(historyData.receivingWallet, secretKey)
                .toString(CryptoJS.enc.Utf8)
                .split(":")[0];

            } catch (error) {
                console.log("\nError decrypting wallet address:", error);
                historyData.receivingWallet = null;
            }
    }

    console.log("receivingWallet2", historyData.receivingWallet);


    // historyData.date = new Date().toISOString();.toLocaleDateString('en-GB').replace(/\//g, '-');
    historyData.date = new Date().toISOString();
    historyData.sendingWallet = historyData.sendingWallet === 'fundingWallet' ? 'Funding Wallet' : 'Trading Wallet';
    historyData.receivingWallet = historyData.receivingWallet || 'External Wallet user';


    await TransactionHistoryRepo.save(historyData);
}


module.exports = {
    getTransactionHistory,
    updateTransactionHistory
};
