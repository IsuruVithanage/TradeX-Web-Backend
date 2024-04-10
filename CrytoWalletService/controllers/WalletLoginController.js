const express = require('express');
const dataSource = require("../config/config");
const bcrypt = require('bcrypt')

const login = async (req, res) => {
    res.json("login");

};

const register = async (req, res) => {
    const {username,password} = req.body;
    console.log(req.body)
    bcrypt.hash(password,10).then((hash) => {
        console.log(hash)
        res.status(200).json({"hash": hash, "password": password})
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