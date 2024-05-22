const dataSource = require("../config/config"); // Assuming dataSource is where your TypeORM connection is established
const main = require("../index");

const saveAnswer = async (req, res) => {
  const AnswerRepo = dataSource.getRepository("Forum-answers");
  const Answersave = AnswerRepo.save(req.body);
  res.json(Answersave);
};

const getAnswersByQuestionId = async (req, res) => {
  const questionId = req.params.questionId;
  const AnswerRepo = dataSource.getRepository("Forum-answers");
  const answers = await AnswerRepo.find({ where: { questionId: questionId } });
  res.json(answers);
};

const getAnswersByUserId = async (req, res) => {
  const userId = req.params.userId;
  const AnswerRepo = dataSource.getRepository("Forum-answers");
  const answers = await AnswerRepo.find({ where: { userId: userId } });
  res.json(answers);
};
//add like
const addLike = async (req, res, next) => {
  const postId = req.params.qid;
  const userId = req.params.uid; // Assuming user ID is available in req.user

  try {
    const PostRepo = dataSource.getRepository("Forum-answers");

    // Find the post by its ID
    const post = await PostRepo.findOne({ where: { answerId: postId } });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Add the user ID to the likes set if it's not already present
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await PostRepo.save(post);
    }

    // Retrieve all posts, sorted by creation date
    const posts = await PostRepo.find({
      order: {
        createdAt: "DESC",
      },
      relations: ["postedBy"], // Assuming postedBy is a relation in your entity
    });

    // Emit the updated posts
    main.io.emit("add-like", posts);

    res.status(200).json({
      success: true,
      post,
      posts,
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

// Other controller functions for answers (if needed)

module.exports = {
  saveAnswer,
  getAnswersByQuestionId,
  getAnswersByUserId,
  addLike,
  // Other exported functions for answers
};
