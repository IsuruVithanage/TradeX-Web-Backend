const express = require('express');
const controller = require("../controllers/UserController");
const router = express.Router();

router.get("/", controller.getAllUsers);

router.post("/", controller.saveUser);

router.delete("/:id", controller.deleteUser);


module.exports = router