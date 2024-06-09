const express = require('express');
const dataSource = require("../config/config");

const getAllCoins = async (req, res) => {
    const CoinsRepo = dataSource.getRepository("watchlist");
    res.json(await CoinsRepo.find());
};

const saveCoins = async (req, res) => {
    const CoinsRepo = dataSource.getRepository("watchlist");
    const Coinsave = CoinsRepo.save(req.body);
    res.json(Coinsave);
};

const deleteCoins = async (req, res) => {
    const CoinsRepo = dataSource.getRepository("watchlist");
    const CoinsId = req.params.id;

    try {
        const CoinsTodelete = await CoinsRepo.findOne({
            where: {
                CoinsId: CoinsId,
            },
        })

        if (!CoinsTodelete) {
            return res.status(404).json({message: 'Coins not found'});
        }

        await CoinsRepo.delete(CoinsTodelete);
        res.json({message: 'Coins deleted successfully'});
    } catch (error) {
        console.error("Error deleting Coins:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};


module.exports = {
    getAllCoins,
    saveCoins,
    deleteCoins
}