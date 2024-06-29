const express = require("express");
const controller = require("../controllers/AdminController");
const router = express.Router();

//GET Requests
router.get("/getUserCount", controller.getUserCount);

router.get("/getPendingUsers", controller.getPendingUsers);

router.get("/getVerifiedUserCount", controller.getVerifiedUserCount);

router.get("/getUsersWithVerificationIssues", controller.getUsersWithVerificationIssues);

router.get("/getAllUsers", controller.getAllUsers);

router.post("/getUserVerificationDetails", controller.getUserVerificationDetails);

router.post("/changeUserRole", controller.changeUserRole);

router.post("/addIssue", controller.addIssue);

module.exports = router;
