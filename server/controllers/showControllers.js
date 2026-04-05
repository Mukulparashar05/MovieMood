import axios from "axios"
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

const tmdbHeaders = {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
};

const pickTrailer = (videos = []) => {
    const preferredTrailer = videos.find((video) =>
        video.site === 'YouTube' && video.type === 'Trailer' && video.official
    );

    const fallbackTrailer = videos.find((video) =>
        video.site === 'YouTube' && ['Trailer', 'Teaser', 'Clip'].includes(video.type)
    );

    return preferredTrailer || fallbackTrailer || null;
};

const buildMovieDetails = async (movieId) => {
    const [movieDetailsResponse, movieCreditsResponse, movieVideosResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: tmdbHeaders
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            headers: tmdbHeaders
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
            headers: tmdbHeaders
        }),
    ]);

    const movieApiData = movieDetailsResponse.data;
    const movieCreditsData = movieCreditsResponse.data;
    const movieVideosData = movieVideosResponse.data;
    const trailer = pickTrailer(movieVideosData.results);

    return {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
        trailerKey: trailer?.key || "",
        trailerSite: trailer?.site || "",
        trailerUrl: trailer?.site === 'YouTube' ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
    };
};

const ensureMovieMedia = async (movie) => {
    if (!movie) {
        return movie;
    }

    if (movie.trailerUrl) {
        return movie;
    }

    try {
        const movieDetails = await buildMovieDetails(movie._id);
        Object.assign(movie, {
            trailerKey: movieDetails.trailerKey,
            trailerSite: movieDetails.trailerSite,
            trailerUrl: movieDetails.trailerUrl,
            backdrop_path: movie.backdrop_path || movieDetails.backdrop_path,
            poster_path: movie.poster_path || movieDetails.poster_path,
        });
        await movie.save();
    } catch (error) {
        console.error(`Unable to enrich movie ${movie._id} with trailer info`, error.message);
    }

    return movie;
};

const enrichMoviesWithMedia = async (movies = []) => {
    const enriched = await Promise.all(movies.map((movie) => ensureMovieMedia(movie)));
    return enriched.filter(Boolean);
};

//Api to get now playing movies from tmdb api
export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: tmdbHeaders
        })
        const movies = data.results;
        res.json({ success: true, movies: movies })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }



}

//Api to add a new show to the database
export const addShow = async (req, res) => {
    try {
        const { movieId,showsInput,showPrice } = req.body
        if (!movieId || !Array.isArray(showsInput) || !showsInput.length || !showPrice) {
            return res.status(400).json({ success: false, message: 'movieId, showsInput and showPrice are required' })
        }

        let movie = await Movie.findById(movieId)

        if (!movie) {
            const movieDetails = await buildMovieDetails(movieId);
            movie = await Movie.create(movieDetails);
        } else {
            await ensureMovieMedia(movie);
        }
        const showsToCreate = [];
        showsInput.forEach(s => {
            const showDate = s.date;
            s.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                const showDateTime = new Date(dateTimeString);

                if (Number.isNaN(showDateTime.getTime()) || showDateTime < new Date()) {
                    return;
                }

                showsToCreate.push({
                    movie: movieId.toString(),
                    showDateTime,
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });
        if(showsToCreate.length > 0){
            await Show.insertMany(showsToCreate);
        } else {
            return res.status(400).json({ success: false, message: 'No valid future showtimes were provided' })
        }

        res.json({success:true,message:'Show Added Successfully.'})

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

export const getShowSchedule = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } })
            .populate('movie')
            .sort({ showDateTime: 1 });

        const enrichedShows = await Promise.all(
            shows.map(async (show) => {
                if (show.movie) {
                    await ensureMovieMedia(show.movie);
                }

                return show;
            })
        );

        res.json({ success: true, shows: enrichedShows });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

export const getFeaturedTrailers = async (req, res) => {
    try {
        const upcomingShows = await Show.find({ showDateTime: { $gte: new Date() } })
            .populate('movie')
            .sort({ showDateTime: 1 });

        const uniqueMovies = Array.from(
            new Map(
                upcomingShows
                    .filter((show) => show.movie)
                    .map((show) => [show.movie._id.toString(), show.movie])
            ).values()
        );

        const enrichedMovies = await enrichMoviesWithMedia(uniqueMovies);
        const trailers = enrichedMovies.filter((movie) => movie.trailerUrl).slice(0, 6);

        res.json({ success: true, trailers });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all shows from database

export const getShows = async(req,res) =>{
    try{
        const shows = await Show.find({showDateTime:{$gte:new Date()}}).populate('movie').sort({showDateTime:1});

        const uniqueShows = Array.from(
            new Map(
                shows
                    .filter((show) => show.movie)
                    .map((show) => [show.movie._id.toString(), show.movie])
            ).values()
        );

        const enrichedMovies = await enrichMoviesWithMedia(uniqueShows);

        res.json({success:true,shows:enrichedMovies})
    } catch(error){
console.error(error);
res.json({success:false,message:error.message});
    }
}

//API to get a single show from the database
export const getShow = async(req,res) =>{
    try{
        const {movieId} = req.params;
        //get all upcomming show for the movies 
        const show = await Show.find({movie:movieId,showDateTime:{$gte:new Date()}}).sort({ showDateTime: 1 })
        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' })
        }

        await ensureMovieMedia(movie);

        const dateTime = {};

        show.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if(!dateTime[date]){
                dateTime[date] = []
            }
          dateTime[date].push({time:show.showDateTime,showId:show._id})

        })
        res.json({success:true,movie,dateTime})
    } catch(error){
        console.error(error);
        res.json({success:false,message:error.message});
        
    }
}

export const refreshMovieTrailers = async (req, res) => {
    try {
        const movies = await Movie.find({
            $or: [
                { trailerUrl: { $exists: false } },
                { trailerUrl: '' },
            ],
        });

        const enrichedMovies = await enrichMoviesWithMedia(movies);

        res.json({
            success: true,
            updated: enrichedMovies.filter((movie) => movie.trailerUrl).length,
            totalChecked: movies.length,
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}
