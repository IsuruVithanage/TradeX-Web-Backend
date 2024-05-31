const express = require("express");
const dataSource = require("../config/config");

const getAllQuestions = async (req, res) => {
  const QuestionRepo = dataSource.getRepository("Forum-question");
  res.json(await QuestionRepo.find());
};

const getQuestionsByUserId = async (req, res) => {
  const userId = req.params.userId;
  const QuestionRepo = dataSource.getRepository("Forum-question");
  const questions = await QuestionRepo.find({ where: { userId: userId } });
  res.json(questions);
};
const getQuestionsByQuestionId = async (req, res) => {
  const questionId = req.params.questionId;
  const QuestionRepo = dataSource.getRepository("Forum-question");
  const questions = await QuestionRepo.find({
    where: { questionId: questionId },
  });
  res.json(questions);
};

const saveQuestion = async (req, res) => {
  const QuestionRepo = dataSource.getRepository("Forum-question");
  const Questionsave = QuestionRepo.save(req.body);
  res.json(Questionsave);
};

const deleteQuestion = async (req, res) => {
  const QuestionRepo = dataSource.getRepository("Forum-question");
  const QuestionId = req.params.id;

  try {
    const QuestionToDelete = await QuestionRepo.findOne({
      where: {
        QuestionId: QuestionId,
      },
    });

    if (!QuestionToDelete) {
      return res.status(404).json({ message: "Forum-question not found" });
    }

    await QuestionRepo.remove(QuestionToDelete);
    res.json({ message: "Forum-question deleted successfully" });
  } catch (error) {
    console.error("Error deleting Forum-question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Adding favorites
const addFavorite = async (req, res) => {
  const { userId, questionId, title } = req.body;
  try {
    const FavoriteRepo = dataSource.getRepository("Favourites"); // Use the Favourites entity schema
    const newFavorite = await FavoriteRepo.save({ userId, questionId, title });
    res.status(200).json(newFavorite);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: error.message });
  }
};
// Getting favorites by userId
const getFavoritesByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const FavoriteRepo = dataSource.getRepository("Favourites");
    const favorites = await FavoriteRepo.find({ where: { userId } });

    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllQuestions,
  saveQuestion,
  deleteQuestion,
  getQuestionsByUserId,
  getQuestionsByQuestionId,
  addFavorite,
  getFavoritesByUserId,
};
