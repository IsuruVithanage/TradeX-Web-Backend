const express = require('express');
const controller = require("../controllers/AnswerController");
const router = express.Router();



router.post("/saveAnswer", controller.saveAnswer);
router.get("/getAnswersByQuestionId/:questionId", controller.getAnswersByQuestionId);

router.get("/getAnswersByUserId/:userId", controller.getAnswersByUserId);




module.exports = router

