const express = require('express');
const AssetController = require("../controllers/AssetController");
const router = express.Router();

router.get("/:wallet", AssetController.getAllAssets);

router.post("/", AssetController.addAsset);

router.put("/", AssetController.updateAsset);

router.delete("/", AssetController.deleteAsset);


module.exports = router