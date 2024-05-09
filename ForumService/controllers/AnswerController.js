

const dataSource = require("../config/config"); // Assuming dataSource is where your TypeORM connection is established

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

// Other controller functions for answers (if needed)

module.exports = {
    saveAnswer,
    getAnswersByQuestionId,
    getAnswersByUserId
    // Other exported functions for answers
};
