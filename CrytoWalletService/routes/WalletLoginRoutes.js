const express = require('express');
const controller = require("../controllers/WalletLoginController");
const router = express.Router();

router.post("/register", controller.register);


router.post("/login", controller.login);


router.get("/profile",controller.profile);



module.exports = router