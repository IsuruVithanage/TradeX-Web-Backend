const express = require('express');
const dataSource = require("../config/config");
const bcrypt = require('bcrypt')
const userRepo = dataSource.getRepository("UserDetail");


const login = async (req, res) => {
    const usersave = userRepo.save(req.body);
    res.json(usersave);

};

const register = async (req, res) => {
    const {username,password} = req.body;
    
    bcrypt.hash(password,10).then(async(hash) => {
        const user = await userRepo.findOne({
            where: {
                "userName": username
            }
        })

        if(user){
            return res.status(400).json({"message": "User Already existing"})
        }

        userRepo.save({
            "userName": username, 
            "password": hash
        }).then(()=>{
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
   profile
}