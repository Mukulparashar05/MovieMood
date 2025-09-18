import express from "express";
import { getFavorites, getUserBookings, updateFavorites } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/bookings',getUserBookings)
userRouter.post('/update-favorite',updateFavorites)
userRouter.get('/favorites',getFavorites)

export default userRouter;