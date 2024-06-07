const express = require('express');
const controller = require("../controllers/AdminController");
const router = express.Router();

router.get("/getAllAdmins", controller.getAllAdmins);

router.post("/saveAdmin", controller.saveAdmin);

router.delete("/:id", controller.deleteAdmin);

router.get("/getAdminCount", controller.getAdminCount);


module.exports = router