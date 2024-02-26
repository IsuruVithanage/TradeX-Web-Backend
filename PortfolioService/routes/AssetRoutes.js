const express = require('express');
const controller = require("../controllers/AssetController");
const router = express.Router();

router.get("/:wallet", controller.getAllAssets);

router.post("/", controller.addAsset);

router.put("/", controller.updateAsset);

router.delete("/", controller.deleteAsset);


module.exports = router