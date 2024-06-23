require ("dotenv").config();
const CryptoJS = require("crypto-js");
const dataSource = require("../config/config");
const addressRepo = dataSource.getRepository("Address");
const secretKey = process.env.SECRET_KEY


const generateWalletAddress = async (req, res) => {
    try{

        const { userName, userId } = req.body;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const iv = CryptoJS.lib.WordArray.random(16);
        let margin = '';

        for(let i=0; i < 25 - userName.length; i++){
            margin += (i === 0) ? ':' : characters.charAt(Math.floor(Math.random() * characters.length));
        }


        if(!userId || !userName){
            return res.status(400).json({message:"invalid request"})
        }

        const walletAddress = CryptoJS.AES.encrypt(userName + margin, secretKey, {iv: iv}).toString();

        const isExists = await addressRepo.exists({ where: { walletAddress } });

        if (isExists) {
            return await generateWalletAddress(req, res);
        } else {
            await addressRepo.save({ userId, walletAddress });
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
        const address  = await addressRepo.findOne({ where:{ userId }});
        return !address ? null : address.walletAddress;
    }
    catch(error){
        console.log("error fetching wallet Address", error);
        return null;
    }
}



const getUserId = async (walletAddress) => {
    try{
        const  address  = await addressRepo.findOne({ where:{ walletAddress }});
        return !address ? null : address.userId;
    }
    catch(error){
        console.log("error fetching user", error);
        return null;
    }
}

const getUserName = async (walletAddress) => {
    try{
        return CryptoJS.AES
        .decrypt(walletAddress, secretKey)
        .toString(CryptoJS.enc.Utf8)
        .split(":")[0];
    }
    catch(error){
        console.log("\nError decrypting wallet address:", error);
        return null;
    }
}




module.exports = {
    generateWalletAddress,
    getWalletAddress,
    getUserId,
    getUserName
};