import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import { getAuthUserId } from "../middleware/auth.js";



//API controller function to get user bookings
export const getUserBookings = async(req,res)=>{
    try{
        const userId = getAuthUserId(req);
        const bookings = await Booking.find({ user: userId }).populate({path:'show',
        populate:{path:"movie"}}).sort({createdAt:-1})
        res.json({success:true,bookings})
    }catch(error){
        console.error(error.message);
        res.json({success:false,message:error.message});

    }
}
//api controller function to update favourite movie id in teh clerk user metadata
export const updateFavorites = async(req,res)=>{
    try{
        const {movieId} = req.body;
        const userId = getAuthUserId(req);
        const user = await clerkClient.users.getUser(userId)
        const favorites = Array.isArray(user.privateMetadata.favorites)
            ? [...user.privateMetadata.favorites]
            : [];

        if(!favorites.includes(movieId)){
            favorites.push(movieId)
        }else{
            favorites.splice(favorites.indexOf(movieId), 1)
        }
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                ...user.privateMetadata,
                favorites,
            }
        })

        res.json({success:true,message:"Favorite movie updated"})
    }catch(error){
        console.error(error.message);
        res.json({success:false,message:error.message});
    }
}
//get favorite movies
export const getFavorites = async (req,res) =>{
    try{
        const userId = getAuthUserId(req);
        const user = await clerkClient.users.getUser(userId)
        const favorites = Array.isArray(user.privateMetadata.favorites)
            ? user.privateMetadata.favorites
            : [];

        //get movies from data base
        const movies = await Movie.find({_id:{$in: favorites}})

        res.json({success:true,movies})
    }catch(error){
        console.error(error.message);
        res.json({success:false,message:error.message})
    }
}
