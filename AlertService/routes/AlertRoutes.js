const express = require('express');
const controller = require("../controllers/AlertController");
const router = express.Router();

router.get("/", controller.getAllAlerts);

router.post("/", controller.addAlert);

router.put("/", controller.editAlert);

router.delete("/", controller.deleteAlert);


module.exports = router