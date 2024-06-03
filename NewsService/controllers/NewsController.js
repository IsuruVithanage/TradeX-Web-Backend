const e = require('express');
const express = require('express');
const dataSource = require("../config/config");
const newsRepo = dataSource.getRepository("News");
const favRepo = dataSource.getRepository("Favourite");
const likeRepo = dataSource.getRepository("Like");
const dislikeRepo = dataSource.getRepository("Dislike");
const Like = require("../models/Like")
const Dislike = require("../models/Dislike")
const Favorite = require("../models/Favourite")
const axios = require('axios');

axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=bc6db274836c4c21aa4569104f316c17')
.then((res)=>{
  saveNews(res.data.articles)
})
.catch((error)=>{
    console.log(error);
})


const getAllNews = async (req, res) => {
    try{
        const userId = req.params.userId;
        const news = await newsRepo.createQueryBuilder('news')
        .leftJoin(
            qb => qb
                .select('like.newsId', 'newsId')
                .addSelect('COUNT(*)', 'likeCount')
                .from(Like, 'like')
                .groupBy('like.newsId'),
            'like_counts',
            'like_counts."newsId" = news.newsId'
        )
        .leftJoin(
            qb => qb
                .select('dislike.newsId', 'newsId')
                .addSelect('COUNT(*)', 'dislikeCount')
                .from(Dislike, 'dislike')
                .groupBy('dislike.newsId'),
            'dislike_counts',
            'dislike_counts."newsId" = news.newsId'
        )
        .leftJoin(
            qb => qb
                .select('like.newsId', 'newsId')
                .addSelect('BOOL_OR(like.userId = :userId)', 'isLiked')
                .from(Like, 'like')
                .groupBy('like.newsId')
                .setParameter('userId', userId),
            'user_likes',
            'user_likes."newsId" = news.newsId'
        )
        .leftJoin(
            qb => qb
                .select('dislike.newsId', 'newsId')
                .addSelect('BOOL_OR(dislike.userId = :userId)', 'isDisliked')
                .from(Dislike, 'dislike')
                .groupBy('dislike.newsId')
                .setParameter('userId', userId),
            'user_dislikes',
            'user_dislikes."newsId" = news.newsId'
        )
        .leftJoin(
            qb => qb
                .select('favorite.newsId', 'newsId')
                .addSelect('BOOL_OR(favorite.userId = :userId)', 'isFavorite')
                .from(Favorite, 'favorite')
                .groupBy('favorite.newsId')
                .setParameter('userId', userId),
            'user_favorites',
            'user_favorites."newsId" = news.newsId'
        )
        .select([
            'news.newsId AS "newsId"',
            'news.title AS "title"',
            'news.description AS "description"',
            'news.url AS "url"',
            'news.image AS "image"',
            'like_counts."likeCount" AS "likeCount"',
            'dislike_counts."dislikeCount" AS "dislikeCount"',
            'user_likes."isLiked" AS "isLiked"',
            'user_dislikes."isDisliked" AS "isDisliked"',
            'user_favorites."isFavorite" AS "isFavorite"'
        ])
        .where('news.latest = true') 
        .orderBy('news.publishedAt', 'DESC')
        .getRawMany();

        res.status(200).json(news);
    }

    catch(error){
        console.log("error getting news", error);
        res.status(500).json({message:"error getting news"});
    }
    
};

const getFavNews  = async (req, res)  => {
   try{
    const userId = req.params.userId;
    if(!userId){
        return res.status(400).json({message:"userID not found"});
    }

    const news = await newsRepo.createQueryBuilder('news')
        .innerJoin(
            'favourite', 'fav',
            'fav.newsId = news.newsId AND fav.userId = :userId',
            { userId }
        )
        .leftJoin(
            qb => qb
                .select('like.newsId', 'newsId')
                .addSelect('COUNT(*)', 'likeCount')
                .from(Like, 'like')
                .groupBy('like.newsId'),
            'like_counts',
            'like_counts."newsId" = news.newsId'
        )
        .leftJoin(
            qb => qb
                .select('dislike.newsId', 'newsId')
                .addSelect('COUNT(*)', 'dislikeCount')
                .from(Dislike, 'dislike')
                .groupBy('dislike.newsId'),
            'dislike_counts',
            'dislike_counts."newsId" = news.newsId'
        )
        .leftJoin(
            qb => qb
                .select('like.newsId', 'newsId')
                .addSelect('BOOL_OR(like.userId = :userId)', 'isLiked')
                .from(Like, 'like')
                .groupBy('like.newsId')
                .setParameter('userId', userId),
            'user_likes',
            'user_likes."newsId" = news.newsId'
        )
        .leftJoin(
            qb => qb
                .select('dislike.newsId', 'newsId')
                .addSelect('BOOL_OR(dislike.userId = :userId)', 'isDisliked')
                .from(Dislike, 'dislike')
                .groupBy('dislike.newsId')
                .setParameter('userId', userId),
            'user_dislikes',
            'user_dislikes."newsId" = news.newsId'
        )
        .select([
            'news.newsId AS "newsId"',
            'news.title AS "title"',
            'news.description AS "description"',
            'news.url AS "url"',
            'news.image AS "image"',
            'news.publishedAt AS "publishedAt"',
            'like_counts."likeCount" AS "likeCount"',
            'dislike_counts."dislikeCount" AS "dislikeCount"',
            'user_likes."isLiked" AS "isLiked"',
            'user_dislikes."isDisliked" AS "isDisliked"',
            'true AS "isFavorite"'
        ])
        .orderBy('news.publishedAt', 'DESC')
        .getRawMany();

        res.status(200).json(news);
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
        
        const isFaved = await favRepo.findOne({where:{userId,newsId}});


        if(addToFav){
            if(isFaved){
                return res.status(200).json({message:"Added to Favourite"});
            }            
            await newsRepo.update(newsId, { favourite: true });
            await favRepo.save({userId,newsId })
            res.status(200).json({message:"Added to Favourite"}) 
        }
        else{
            if(!isFaved){
                return res.status(200).json({message:"Removed from Favourite"});
            }   
            await favRepo.remove({userId,newsId })

            const favCount = await favRepo.createQueryBuilder('favourite')
                .select('COUNT(*)', 'favCount')
                .where('favourite.newsId = :newsId', { newsId })
                .getRawOne();

            if(favCount.favCount === '0'){
                const isLatest = await newsRepo.findOne({select: ['latest'], where:{newsId}});

                if(isLatest.latest){
                    await newsRepo.update(newsId, { favourite: false });
                }
                else{
                    await newsRepo.remove({newsId});
                }
            }
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
        if(isLike === undefined || !userId || !newsId){
            return res.status(400).json({message: "invalid request"});
        }

        const isLiked = await likeRepo.findOne({where:{userId,newsId}});
        const news = await newsRepo.findOne({where:{newsId}})

        if(!news){
            return res.status(404).json({message:"News not found"});
        }

        if(isLike){
            if(!isLiked){
                await likeRepo.save({userId,newsId })
            }            
        }
        else{
            if(isLiked){
                await likeRepo.remove({userId,newsId })
            }        
        }

        const likeCount = await likeRepo.createQueryBuilder('like')
            .select('COUNT(*)', 'likeCount')
            .where('like.newsId = :newsId', { newsId })
            .getRawOne();

        res.status(200).json(likeCount);
    }

    catch(error){
        console.log(error);
        return res.status(500).json({message: error.message});
    }
}

const dislike = async (req, res) => {
    try{
        const {isDislike, userId, newsId} = req.body;
        if(isDislike === undefined || !userId || !newsId){
            return res.status(400).json({message: "invalid request"});
        }

        const isDisliked = await dislikeRepo.findOne({where:{userId,newsId}});
        const news = await newsRepo.findOne({where:{newsId}})

        if(!news){
            return res.status(404).json({message:"News not found"});
        }

        if(isDislike){
            if(!isDisliked){
                await dislikeRepo.save({userId,newsId })
            }            
        }
        else{
            if(isDisliked){
                await dislikeRepo.remove({userId,newsId })
            }        
        }

        const dislikeCount = await dislikeRepo.createQueryBuilder('dislike')
            .select('COUNT(*)', 'dislikeCount')
            .where('dislike.newsId = :newsId', { newsId })
            .getRawOne();

        res.status(200).json(dislikeCount);
    }
    catch(error){
    console.log(error);
    return res.status(500).json({message: error.message});
    }
}

const saveNews = async (news) => {
   try{
    const currentURLs = (await newsRepo.find()).map((news) => news.url);

    const newsToSave = news
        .map((newsItem) => {
            if (currentURLs.includes(newsItem.url)) {
                return null;
            } else {
                return{
                    url: newsItem.url,
                    image: newsItem.urlToImage,
                    title: newsItem.title,
                    description: newsItem.description,
                    publishedAt: newsItem.publishedAt,
                    latest: true,
                };
            }
        })
        .filter((item) => item !== null)
        .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

        console.log("newsToSave", newsToSave);
    
    await newsRepo.save(newsToSave);
   }

   catch (error){
        console.log("error saving news", error);
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
    like,
    dislike
}