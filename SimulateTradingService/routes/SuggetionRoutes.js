const express = require('express');
const controller = require("../controllers/SuggetionController");
const router = express.Router();
const { verifyToken, checkRole } = require('../../auth');

router.post("/buyOrderSuggestion", controller.buyOrderSuggestion);


module.exports = router