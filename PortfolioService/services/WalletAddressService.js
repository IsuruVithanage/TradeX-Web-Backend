const CryptoJS = require("crypto-js");
const dataSource = require("../config/config");
const walletAddressRepo = dataSource.getRepository("WalletAddress");

const generateWalletAddress = async (req, res) => {
    try{
        const { userName, userId } = req.body;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const iv = CryptoJS.lib.WordArray.random(16);
        const secretKey = "portfolioUser@TradeX";
        let margin = '';

        for(let i=0; i < 25 - userName.length; i++){
            margin += (i === 0) ? ':' : characters.charAt(Math.floor(Math.random() * characters.length));
        }

        const walletAddress = CryptoJS.AES.encrypt(userName + margin, secretKey, { iv: iv }).toString();

        const isExists = await walletAddressRepo.exists({ where: { walletAddress } });

        if (isExists) {
            return await generateWalletAddress(req, res);
        } else {
            await walletAddressRepo.save({ userId, walletAddress });
            return !res ? true : res.status(200).json({ walletAddress });
        }
    }

    catch(error){
        console.log("error generating wallet Address", error);
        return !res ? false : res.status(500).json({ message: "error generating wallet Address" });
    }
}



const getWalletAddress = async (userId) => {
    try{
        const { walletAddress } = await walletAddressRepo.findOne({ where:{ userId }});
        return walletAddress;
    }
    catch(error){
        console.log("error fetching wallet Address", error);
        return null;
    }
}



const getUserId = async (walletAddress) => {
    try{
        const { userId } = await walletAddressRepo.findOne({ where:{ walletAddress }});
        return userId;
    }
    catch(error){
        console.log("error fetching user", error);
        return null;
    }
}



module.exports = {
    generateWalletAddress,
    getWalletAddress,
    getUserId
};