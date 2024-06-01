const express = require('express');
const dataSource = require("../config/config");
const { shuffle } = require("lodash"); // Import shuffle function from lodash
const { request } = require('express');

const words = [
    "word1",
    "word2",
    "word3",
    "word4",
    "word5",
    "word6",
    "word7",
    "word8",
    "word9",
    "word10",
    "word11",
    "word12",
];

const shuffleWords = () => {
    // Shuffle the words array
    const shuffledWords = shuffle(words);
    return shuffledWords.join(','); // Join shuffled words into a single string
};
const getSeedPreseById = async (req,res) => {
    try {
        const id = req.body;
        const seedPhraseRepo = dataSource.getRepository("SeedPhrase");
        const words = await seedPhraseRepo.find({where: {userId:id}});
        res.json(words);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const saveSeedPrase = async (req, res) => {
    const seedPhraseRepo = dataSource.getRepository("SeedPhrase");
    try {
        const saveSeedPrase = await seedPhraseRepo.save(req.body);
        res.json(saveSeedPrase);
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const checkSimilarities = async (shuffledWords) => {
    const seedPhraseRepo = dataSource.getRepository("SeedPhrase");
    // Query the database to check for similarities with shuffledWords
    const seedPhrases = await seedPhraseRepo.find();
    for (const seedPhrase of seedPhrases) {
        // Compare the shuffled words with the seed phrase records
        if (seedPhrase.words === shuffledWords) {
            return true; // Similarities found
        }
    }
    return false; // No similarities found
};

const getUniqueShuffledWords = async (req, res) => {
    let shuffledWords = shuffleWords();
    let similaritiesFound = await checkSimilarities(shuffledWords);
    while (similaritiesFound) {
        shuffledWords = shuffleWords();
        similaritiesFound = await checkSimilarities(shuffledWords);
    }
    res.json({ words: shuffledWords.split(',') }); // Split the string back into an array before sending to frontend
};

module.exports = {
    getUniqueShuffledWords,
    getSeedPreseById,
    saveSeedPrase
};
