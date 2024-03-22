const express = require('express');
const dataSource = require("../config/config");

const getAllNews = async (req, res) => {
    const newsRepo = dataSource.getRepository("News");
    res.json(await newsRepo.find());
};

const saveNews= async (req, res) => {
    const newsRepo = dataSource.getRepository("News");
    const newssave = newsRepo.save(req.body);
    res.json(newssave);
};

const deleteNews= async (req, res) => {
    const newsRepo = dataSource.getRepository("News");
    const newsId = req.params.id;

    try {
        const newsToDelete = await newsRepo.findOne({
            where: {
                newsId: newsId,
            },
        })

        if (!newsToDelete) {
            return res.status(404).json({message: 'News not found'});
        }

        await newsRepo.remove(newsToDelete);
        res.json({message: 'News deleted successfully'});
    } catch (error) {
        console.error("Error deleting news:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};


module.exports = {
    getAllNews,
    saveNews,
    deleteNews
}