const express = require("express");
const controller = require("../controllers/ForumController");
const router = express.Router();

router.get("/getAllQuestions", controller.getAllQuestions);

router.get("/getQuestionsByUserId/:userId", controller.getQuestionsByUserId);

router.get(
  "/getQuestionsByQuestionId/:questionId",
  controller.getQuestionsByQuestionId
);
router.post("/", controller.saveQuestion);

router.delete("/:id", controller.deleteQuestion);

router.put("/addLike/:qid/:uid", controller.addLike);

router.post("/addFavorite", controller.addFavorite);

router.get("/getFavoritesByUserId/:userId", controller.getFavoritesByUserId);

module.exports = router;
