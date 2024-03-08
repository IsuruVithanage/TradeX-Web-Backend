const express = require('express');
const dataSource = require("../config/config");

const getAllQuestions = async (req, res) => {
    const userRepo = dataSource.getRepository("Question");
    res.json(await userRepo.find());
};

const saveQuestion = async (req, res) => {
    const userRepo = dataSource.getRepository("Question");
    const usersave = userRepo.save(req.body);
    res.json(usersave);
};

const deleteQuestion = async (req, res) => {
    const userRepo = dataSource.getRepository("Question");
    const userId = req.params.id;

    try {
        const userToDelete = await userRepo.findOne({
            where: {
                userId: userId,
            },
        })

        if (!userToDelete) {
            return res.status(404).json({message: 'Question not found'});
        }

        await userRepo.remove(userToDelete);
        res.json({message: 'Question deleted successfully'});
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};


module.exports = {
    getAllQuestions,
    saveQuestion,
    deleteQuestion
}