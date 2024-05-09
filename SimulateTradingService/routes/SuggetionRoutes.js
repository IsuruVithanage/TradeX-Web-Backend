const express = require('express');
const controller = require("../controllers/SuggetionController");
const router = express.Router();

router.get("/buyOrderSuggestion", controller.buyOrderSuggestion);


module.exports = router