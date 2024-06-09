const express = require('express');
const SeedPraseController = require("../controllers/SeedPraseController");
const router = express.Router();


router.get("/getUniqueShuffledWords", SeedPraseController.getUniqueShuffledWords);
router.get("/getSeedPreseById", SeedPraseController.getSeedPreseById);
router.post("/saveSeedPrase", SeedPraseController.saveSeedPrase);





module.exports = router