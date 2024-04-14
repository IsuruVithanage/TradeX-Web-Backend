const express = require('express');
const controller = require("../controllers/AnswerController");
const router = express.Router();



router.post("/saveAnswer", controller.saveAnswer);




module.exports = router

