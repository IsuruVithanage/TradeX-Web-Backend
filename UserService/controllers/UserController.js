const express = require('express');
const dataSource = require("../config/config");

const getAllUsers = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    res.json(await userRepo.find());
};

const saveUser = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const usersave = userRepo.save(req.body);
    res.json(usersave);
};

const deleteUser = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const userId = req.params.id;

    try {
        const userToDelete = await userRepo.findOne({
            where: {
                userId: userId,
            },
        })

        if (!userToDelete) {
            return res.status(404).json({message: 'User not found'});
        }

        await userRepo.remove(userToDelete);
        res.json({message: 'User deleted successfully'});
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};



module.exports = {
    getAllUsers,
    saveUser,
    deleteUser
}