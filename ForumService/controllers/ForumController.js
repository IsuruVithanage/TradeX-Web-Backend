const express = require("express");
const dataSource = require("../config/config");
const { removeLike } = require("./AnswerController");

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

//add like
const addLike = async (req, res, next) => {
  const questionId = parseInt(req.params.qid);
  const userId = parseInt(req.params.uid);

  try {
    const PostRepo = dataSource.getRepository("Forum-addlikes");

    // Find the post by its ID
    let post = await PostRepo.findOne({ where: { questionId: questionId } });

    if (!post) {
      // If the post does not exist, create a new entry with the likes array
      post = PostRepo.create({ questionId: questionId, likes: [userId] });
    } else {
      // If the post exists, update the likes array
      if (!post.likes.includes(userId)) {
        post.likes.push(userId);
      } else {
        return res
          .status(400)
          .json({ success: false, message: "User already liked this post" });
      }
    }

    await PostRepo.save(post);

    // Emit the updated likes if needed
    main.io.emit("add-like", post);

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

//remove like
exports.removeLike = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.user._id },
      },
      { new: true }
    );

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    main.io.emit("remove-like", posts);

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// Adding favorites
const addFavorite = async (req, res) => {
  const { userId, questionId, title } = req.body;
  try {
    const FavoriteRepo = dataSource.getRepository("Favourites"); // Use the Favourites entity schema
    const existingFavorite = await FavoriteRepo.findOne({
      where: { userId, questionId },
    });

    if (existingFavorite) {
      // Remove favorite
      await FavoriteRepo.remove(existingFavorite);
      res.status(200).json({ message: "Favorite removed" });
    } else {
      // Add favorite
      const newFavorite = await FavoriteRepo.save({
        userId,
        questionId,
        title,
      });
      await FavoriteRepo.save(newFavorite);
      res.status(200).json(newFavorite);
    }
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
  addLike,
  removeLike,
};
