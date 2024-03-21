const express = require('express');
const controller = require("../controllers/OrderController");
const router = express.Router();

router.get("/", controller.getAllOrders);

router.post("/", controller.saveOrder);

router.delete("/", controller.deleteOrder);


module.exports = router