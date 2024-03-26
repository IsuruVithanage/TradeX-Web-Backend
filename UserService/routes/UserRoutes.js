const express = require('express');
const controller = require("../controllers/UserController");
const router = express.Router();

router.get("/getAllUsers", controller.getAllUsers);

router.post("/saveUser", controller.saveUser);

router.delete("/:id", controller.deleteUser);


module.exports = router