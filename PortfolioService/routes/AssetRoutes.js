const express = require('express');
const AssetController = require("../controllers/AssetController");
const router = express.Router();

router.get("/overview", AssetController.getOverviewAssets);

router.get("/trading", AssetController.getTradingAssets);

router.get("/funding", AssetController.getFundingAssets);

router.post("/", AssetController.addAsset);

router.put("/", AssetController.tranferAsset);

router.delete("/", AssetController.CheckAssetForDelete);


module.exports = router