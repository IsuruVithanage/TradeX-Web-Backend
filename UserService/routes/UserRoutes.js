const express = require('express');
const controller = require("../controllers/UserController");
const router = express.Router();

router.get("/getAllUsers", controller.getAllUsers);

router.post("/saveUser", controller.saveUser);

router.delete("/:id", controller.deleteUser);

router.get("/getUserCount",controller.getUserCount);

router.get("/getPendingUsers",controller.getPendingUsers);

router.get("/getVerifiedUserCount", controller.getVerifiedUserCount);


module.exports = router