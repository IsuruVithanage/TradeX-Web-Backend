const express = require('express');
const PortfolioValueController = require("../controllers/PortfolioValueController");
const assetOperations = require("../services/AssetService");
const router = express.Router();


router.put("/", assetOperations.getRealtimeTotalValues);

router.get("/", PortfolioValueController.updatePortfolioValueOf);


module.exports = router