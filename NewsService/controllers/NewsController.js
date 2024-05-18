const e = require('express');
const express = require('express');
const dataSource = require("../config/config");
const newsRepo = dataSource.getRepository("News");


const getAllNews = async (req, res) => {
    const newsRepo = dataSource.getRepository("News");
    res.json(await newsRepo.find());
};

const favToNews = async (req, res) => {
   try{
        const {userId,title, description, url, image } = req.body;
        if(!userId || !title || !description || !url || !image ){
            return res.status(400).json({message:"inavalid request"});
        }
        const saved =  await  saveNews(req.body);
        return (saved)? res.status(200).json({message:"like sucessfull"}) : res.status(400).json({message:"like failed"});

   }
   catch (error){
    return res.status(500).json({message: error.message});
   }
}

const saveNews = async (news) => {
   try{
    const {userId,title, description, url, image } = news;
    let newsToFav = await newsRepo.findOne({where: {url : url}});
    if(!newsToFav){
        newsToFav = {
            url: url,
            image: image,
            title: title,
            description: description,
            like: null,
            dislike: null,
            favourite: {userId}
        }
    }
    else{
        if(!newsToFav.favourite){
            newsToFav.favourite = {userId};
        }else{
            newsToFav.favourite.push(userId);
        }
    }
    await newsRepo.save(newsToFav);
    return true;
   }
   catch (error){
        console.log("error saving news", error);
        return false;
   }
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
    deleteNews,
    favToNews
}