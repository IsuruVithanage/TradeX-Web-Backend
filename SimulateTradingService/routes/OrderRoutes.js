const express = require('express');
const controller = require("../controllers/OrderController");
const router = express.Router();

router.get("/getAllOrders", controller.getAllOrders);

router.get("/getLimitOrderByCoin/:coin/:userId", controller.getAllLimitOrdersByCoin);

router.post("/", controller.saveOrder);

router.delete("/deleteOrder/:orderId", controller.deleteOrder);


module.exports = router