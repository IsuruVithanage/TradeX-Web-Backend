const express = require('express');
const TransactionHistoryController = require("../controllers/TransactionHistoryController");
const router = express.Router();


router.get("/", TransactionHistoryController.getTransactionHistory);

router.get("/trading", TransactionHistoryController.getTradingHistory);


module.exports = router