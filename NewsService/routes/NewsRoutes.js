const express = require('express');
const controller = require("../controllers/NewsController");
const router = express.Router();

router.get("/", controller.getAllNews);

router.get("/fav", controller.getFavNews);

router.post("/fav/:addToFav(true|false)", controller.favToNews);

router.delete("/:userId/:title", controller.deleteNews);




module.exports = router