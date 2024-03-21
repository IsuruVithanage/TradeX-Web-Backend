const express = require('express');
const controller = require("../controllers/WalletController");
const router = express.Router();

router.get("/:userId", controller.getAllBalances);

router.post("/", controller.saveUser);

router.delete("/:id", controller.deleteUser);


module.exports = router