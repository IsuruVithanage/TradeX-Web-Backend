const express = require('express');
const controller = require("../controllers/AlertController");
const router = express.Router();

router.get("/", controller.getAlerts);

router.post("/", controller.addAlert);

router.put("/", controller.editAlert);

router.delete("/", controller.deleteAlert);

router.post("/deviceToken", controller.saveDeviceToken);

module.exports = router