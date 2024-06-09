const dataSource = require("../config/config");

const getAllQuestions = async (req, res) => {
    const questionRepo = dataSource.getRepository("Question");
    try {
        const questions = await questionRepo.find();
        res.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const saveQuestion = async (req, res) => {
    const questionRepo = dataSource.getRepository("Question");
    try {
        const questionSave = await questionRepo.save(req.body);
        res.json(questionSave);
    } catch (error) {
        console.error("Error saving question:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteQuestion = async (req, res) => {
    const questionRepo = dataSource.getRepository("Question");
    const questionId = req.params.id;

    try {
        const questionToDelete = await questionRepo.findOne({
            where: {
                questionId: questionId,
            },
        });

        if (!questionToDelete) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await questionRepo.remove(questionToDelete);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllQuestions,
    saveQuestion,
    deleteQuestion
};
