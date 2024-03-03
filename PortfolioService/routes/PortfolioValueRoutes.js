const express = require('express');
const PortfolioValueController = require("../controllers/PortfolioValueController");
const router = express.Router();


router.get("/", PortfolioValueController.getPortfolioValueData);

router.put("/", PortfolioValueController.updatePortfolioValueData);


module.exports = router