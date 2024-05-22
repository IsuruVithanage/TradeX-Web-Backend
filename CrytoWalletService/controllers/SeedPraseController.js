const express = require('express');
const dataSource = require("../config/config");
const { shuffle } = require("lodash"); // Import shuffle function from lodash

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
    getUniqueShuffledWords
};
