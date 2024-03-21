const express = require('express');
const controller = require("../controllers/NewsController");
const router = express.Router();

router.get("/", controller.getAllNews);

router.post("/", controller.saveNews);

router.delete("/:userId/:title", controller.deleteNews);


module.exports = router