import express from "express";
import { getFavorites, getUserBookings, updateFavorites } from "../controllers/userController.js";
import { protectUser } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.get('/bookings',protectUser,getUserBookings)
userRouter.post('/update-favorite',protectUser,updateFavorites)
userRouter.get('/favorites',protectUser,getFavorites)

export default userRouter;
