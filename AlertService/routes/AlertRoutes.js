const express = require('express');
const controller = require("../controllers/AlertController");
const router = express.Router();

router.get("/", controller.getAlerts);

router.post("/", controller.addAlert);

router.put("/", controller.editAlert);

router.delete("/", controller.deleteAlert);

router.delete("/clearAll", controller.clearNotifiedAlerts);

router.post("/deviceToken", controller.saveDeviceToken);

router.post("/send/:type(email|push|both)", controller.sendNotification);

module.exports = router