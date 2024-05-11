const express = require('express');
const TransactionHistoryController = require("../controllers/TransactionHistoryController");
const router = express.Router();


router.get("/", TransactionHistoryController.getTransactionHistory);


module.exports = router