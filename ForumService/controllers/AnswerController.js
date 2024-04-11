

const dataSource = require("../config/config"); // Assuming dataSource is where your TypeORM connection is established

const saveAnswer = async (req, res) => {
    const AnswerRepo = dataSource.getRepository("Forum-answers");
    const Answersave = AnswerRepo.save(req.body);
    res.json(Answersave);
};

// Other controller functions for answers (if needed)

module.exports = {
    saveAnswer,
    // Other exported functions for answers
};
