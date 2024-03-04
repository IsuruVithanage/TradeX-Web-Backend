const express = require('express');
const controller = require("../controllers/QuizController");
const router = express.Router();

router.get("/", controller.getAllQuestions);

router.post("/", controller.saveQuestion);

router.delete("/", controller.deleteQuestion);


module.exports = router