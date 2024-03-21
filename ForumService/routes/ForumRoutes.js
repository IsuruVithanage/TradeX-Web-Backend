const express = require('express');
const controller = require("../controllers/ForumController");
const router = express.Router();

router.get("/getAllQuestions", controller.getAllQuestions);

router.post("/", controller.saveQuestion);

router.delete("/:id", controller.deleteQuestion);


module.exports = router