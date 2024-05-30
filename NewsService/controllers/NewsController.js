const e = require('express');
const express = require('express');
const dataSource = require("../config/config");
const newsRepo = dataSource.getRepository("News");
const favRepo = dataSource.getRepository("Favourite");
const axios = require('axios');

axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=bc6db274836c4c21aa4569104f316c17')
.then((res)=>{
  saveNews(res.data.articles)
})
.catch((error)=>{
    console.log(error);
})


const getAllNews = async (req, res) => {
    res.json(await newsRepo.find({
        where:{latest:true}
    }));
};

const getFavNews  = async (req, res)  => {
   try{
    if(!req.body.userId){
        return res.status(400).json({message:"userID not found"});
    }
    const favNews = await newsRepo.find({
        where: {
            favourite: "{" + req.body.userId + "}"
        }
        
    });
    console.log(favNews);
    res.status(200).json(favNews);
   }
   catch(error){
    console.log ("error getting favourite news", error);
    res.status(500).json({message:"error getting favourite news"});

   }
   
}

const addToFav = async (req, res) => {
   try{
        const addToFav = req.params.addToFav === "true";
        const {userId,newsId} = req.body;
        
        if(!userId || !newsId ){
            return res.status(400).json({message:"inavalid request"});
        }
        
        const news = await favRepo.find({where:{userId,newsId}});


        if(addToFav){
            if(news){
                return res.status(200).json({message:"Added to Favourite"});
            }            
            await newsRepo.update(newsId, { favourite: true });
            await favRepo.save({userId,newsId })
            res.status(200).json({message:"Added to Favourite"}) 
        }
        else{
            if(!news){
                return res.status(200).json({message:"Removed from Favourite"});
            }        
            await favRepo.remove({userId,newsId })
            res.status(200).json({message:"Removed from Favourite"})  
        }
        
        
   }
   catch (error){
    console.log(error);
    return res.status(500).json({message: error.message});
   }
}

const like = async (req, res) => {
    try{
        const {isLike, userId, newsId} = req.body;
        if(!isLike || !userId || !newsId){
            return res.status(400).json({message: "invalid request"});
        }
        const isLiked = await favRepo.find({where:{userId,newsId}});

        if(isLike){
            if(isLiked){
                return res.status(200).json({message:"Liked"});
            }            
            await likeRepo.save({userId,newsId })
            res.status(200).json({message:"Liked"}) 
        }
        else{
            if(!isLiked){
                return res.status(200).json({message:"Removed from Favourite"});
            }        
            await favRepo.remove({userId,newsId })
            res.status(200).json({message:"Removed from Favourite"})  
        }

    }
    catch(error){
    console.log(error);
    return res.status(500).json({message: error.message});
    }
}

const saveNews = async (news) => {
   try{
    const newsToSave = news.map((news)=>{
        return{
            url: news.url,
            image: news.urlToImage,
            title: news.title,
            description: news.description,
            
        }
    }) 
   
    await newsRepo.save(newsToSave);
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
    addToFav,
    getFavNews,
    like
}