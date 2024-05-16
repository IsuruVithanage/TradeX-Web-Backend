const express = require('express');
const SeedPraseController = require("../controllers/SeedPraseController");
const router = express.Router();


router.get("/getUniqueShuffledWords", SeedPraseController.getUniqueShuffledWords);



module.exports = router