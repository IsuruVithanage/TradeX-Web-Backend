const express = require('express');
const controller = require("../controllers/WatchListController");
const router = express.Router();

router.get("/:userId", controller.getCoins);

router.post("/", controller.saveCoins);


module.exports = router