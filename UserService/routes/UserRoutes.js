const express = require("express");
const controller = require("../controllers/UserController");
const router = express.Router();
const { validateToken } = require("../JWT");

//router.get("/getAllUsers", controller.getAllUsers);

//router.post("/saveUser", controller.saveUser);

router.delete("/:id", controller.deleteUser);

router.get("/getUserCount", controller.getUserCount);

router.get("/getPendingUsers", controller.getPendingUsers);

router.get("/getVerifiedUserCount", controller.getVerifiedUserCount);

router.get(
  "/getUsersWithVerificationIssues",
  controller.getUsersWithVerificationIssues
);

router.get("/getAllIssues", controller.getAllIssues);

router.post(
  "/saveUserVerificationDetails",
  controller.saveUserVerificationDetails
);

router.post("/register", controller.register);

router.post("/login", controller.login);

router.get("/profile", validateToken, controller.profile);

module.exports = router;
