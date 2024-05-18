const express = require('express');
const controller = require("../controllers/NewsController");
const router = express.Router();

router.get("/", controller.getAllNews);

router.post("/fav", controller.favToNews);

router.delete("/:userId/:title", controller.deleteNews);


module.exports = router