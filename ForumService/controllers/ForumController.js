const express = require('express');
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
        })

        if (!QuestionToDelete) {
            return res.status(404).json({message: 'Forum-question not found'});
        }

        await QuestionRepo.remove(QuestionToDelete);
        res.json({message: 'Forum-question deleted successfully'});
    } catch (error) {
        console.error("Error deleting Forum-question:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};


module.exports = {
    getAllQuestions,
    saveQuestion,
    deleteQuestion,
    getQuestionsByUserId
}