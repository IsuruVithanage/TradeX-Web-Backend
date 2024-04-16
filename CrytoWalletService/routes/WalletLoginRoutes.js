const express = require('express');
const controller = require("../controllers/WalletLoginController");
const router = express.Router();
const {validateToken} = require('../JWT')


router.post("/register", controller.register);


router.post("/login", controller.login);


router.get("/profile", validateToken,  controller.profile);



module.exports = router