const express = require('express');
const controller = require("../controllers/WatchListController");
const router = express.Router();

router.get("/getAllCoins", controller.getAllCoins);

router.post("/", controller.saveCoins);

router.delete("/:id", controller.deleteCoins);


module.exports = router