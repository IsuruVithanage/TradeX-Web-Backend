const express = require('express');
const AssetController = require("../controllers/AssetController");
const router = express.Router();

router.get("/:wallet", AssetController.getPortfolioData);       // get all portfolio data - portfolio

router.get("/:userId/:coin", AssetController.getBalance);       // get balance of coins - trading platform

router.put("/", AssetController.transferAsset);                 // transfer assets between internal wallets - portfolio

router.put("/hold", AssetController.holdAsset);                 // hold a asset's balance - trading platform

router.post("/trade", AssetController.executeTrade);          // add after buy or transfer from external wallet

router.post("/deduct/:source", AssetController.deductAsset);    // deduct after sell - trading platform



module.exports = router