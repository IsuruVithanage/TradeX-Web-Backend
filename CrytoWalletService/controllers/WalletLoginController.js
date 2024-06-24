const express = require('express');
const dataSource = require("../config/config");
const bcrypt = require('bcrypt')
const userRepo = dataSource.getRepository("UserDetail");
const address = require('./WalletAddress');
const {createAccessToken, createRefreshToken} = require("../JWT");


const login = async (req, res) => {
    const {username,password} = req.body;
    

    const user = await userRepo.findOne({where: {userName: username}});


    if(!user) {return res.status(400).json({error: "User Doesn't Exist"})}


    const dbPassword = user.password;
    bcrypt.compare(password,dbPassword).then((match)=>{
        if(!match){
            res.status(400).json({error: "Wrong Username and Password "})
        }
        else{

            const accessToken = createAccessToken(user);
            const refreshToken = createRefreshToken(user);
        
        
            res.cookie("wallet-refresh-token", refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
            });
        
            const userDetail = {
                id: user.userId,
                userName: user.userName,
            }
        
            res.json({ message: "Logged in", accessToken , user: userDetail});
            
        }
    })

};

const refreshToken = (req, res) => {
    const refreshToken = req.cookies["refresh-token"];
    if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token not found" });
    }

    try {
        const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = createAccessToken(user);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
    }
};

const register = async (req, res) => {
    const {username,password,seedphrase} = req.body;

    bcrypt.hash(password,10).then(async(hash) => {
        const user = await userRepo.findOne({  where: {  "userName": username} });

        if(user){
            return res.status(400).json({"message": "User Name Already taken"})
        }

        userRepo.save({
            "userName": username, 
            "password": hash,
            "seedphrase":seedphrase
        }).then(async()=>{
            const user = await userRepo.findOne({  where: {  "userName": username} });

            if(user){
                address.generateWalletAddress({body: {userId: user.userId, userName: user.userId}});
            }
    
            console.log(hash)
            res.status(200).json({"hash": hash, "password": password})
        }).catch((error)=>{
            console.log(error)
            res.status(400).json(error);
  
        })
    }).catch((error)=>{
        console.log(error)
        res.status(400).json(error);
    })

};

const profile = async (req, res) => {
    res.json("profile");

};

module.exports = {
   register,
   login,
   profile,
   refreshToken
}