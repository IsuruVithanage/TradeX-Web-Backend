const express = require('express');
const TransactionHistoryController = require("../controllers/TransactionHistoryController");
const router = express.Router();


router.get("/", TransactionHistoryController.getTransactionHistoryData);

router.put("/", TransactionHistoryController.updateTransactionHistoryData);


module.exports = router