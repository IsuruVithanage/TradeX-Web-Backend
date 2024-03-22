const express = require('express');
const controller = require("../controllers/EduController");
const router = express.Router();

router.get("/getAllEduResources", controller.getAllEduResources);

router.post("/", controller.saveEduResources);

router.delete("/:id", controller.deleteEduResources);


module.exports = router