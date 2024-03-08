const express = require('express');
const AssetController = require("../controllers/AssetController");
const router = express.Router();

router.get("/:wallet", AssetController.getPortfolioData);

// router.get("/trading", AssetController.getTradingAssets);

// router.get("/funding", AssetController.getFundingAssets);

router.post("/", AssetController.addAsset);

router.put("/", AssetController.tranferAsset);



module.exports = router