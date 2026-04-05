import express from "express";
import { addShow, getFeaturedTrailers, getNowPlayingMovies, getShows, getShow, getShowSchedule, refreshMovieTrailers } from "../controllers/showControllers.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get('/now-playing',protectAdmin,getNowPlayingMovies)
showRouter.post('/add',protectAdmin, addShow)
showRouter.post('/refresh-trailers', protectAdmin, refreshMovieTrailers)

showRouter.get("/all",getShows)
showRouter.get("/schedule", getShowSchedule)
showRouter.get("/trailers", getFeaturedTrailers)
showRouter.get("/:movieId",getShow)
export default showRouter;
