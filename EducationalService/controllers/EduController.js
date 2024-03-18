const express = require('express');
const dataSource = require("../config/config");

const getAllEduResources = async (req, res) => {
    const EduResourcesRepo = dataSource.getRepository("EduResources");
    res.json(await EduResourcesRepo.find());
};

const saveEduResources = async (req, res) => {
    const EduResourcesRepo = dataSource.getRepository("EduResources");
    const EduResourcessave = EduResourcesRepo.save(req.body);
    res.json(EduResourcessave);
};

const deleteEduResources = async (req, res) => {
    const EduResourcesRepo = dataSource.getRepository("EduResources");
    const EduResourcesId = req.params.id;

    try {
        const EduResourcesToDelete = await EduResourcesRepo.findOne({
            where: {
                EduResourcesId: EduResourcesId,
            },
        })

        if (!EduResourcesToDelete) {
            return res.status(404).json({message: 'EduResources not found'});
        }

        await EduResourcesRepo.remove(EduResourcesToDelete);
        res.json({message: 'EduResources deleted successfully'});
    } catch (error) {
        console.error("Error deleting EduResources:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};


module.exports = {
    getAllEduResources,
    saveEduResources,
    deleteEduResources
}