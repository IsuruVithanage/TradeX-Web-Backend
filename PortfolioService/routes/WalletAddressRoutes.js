const express = require('express');
const router = express.Router();
const { generateWalletAddress } = require('../services/WalletAddressService');

router.post("/new", generateWalletAddress);

module.exports = router