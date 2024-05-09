const express = require('express');
const AssetController = require("../controllers/AssetController");
const router = express.Router();

router.get("/:wallet", AssetController.getPortfolioData);       // get all portfolio data - portfolio

router.get("/:userId/:coin", AssetController.getBalance);       // get balance of coins - trading platform

router.put("/", AssetController.transferAsset);                 // transfer assets between internal wallets - portfolio

router.put("/hold", AssetController.holdAsset);                 // hold a asset's balance - trading platform

router.post("/transfer", AssetController.receiveFromEx);        // add after a transaction from external wallet

router.post("/trade", AssetController.executeTrade);            // change balances after a trade - trading platform

router.post("/deduct/:source", AssetController.deductAsset);    // deduct after sell - trading platform

router.post("/allocate", AssetController.allocateUSD);          // allocate USD to a user - Quiz


module.exports = router