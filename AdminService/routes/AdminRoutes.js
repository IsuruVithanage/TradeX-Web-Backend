const express = require('express');
const controller = require("../controllers/AdminController");
const router = express.Router();

router.get("/getAllAdmins", controller.getAllAdmins);

router.post("/", controller.saveAdmin);

router.delete("/:id", controller.deleteAdmin);


module.exports = router