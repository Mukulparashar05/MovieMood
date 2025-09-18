import Show from "../models/Show.js"
import Booking from "../models/Booking.js";
//Function to check availability of the selected seats for a movie
const checkSeatsAvailabilty = async (showId,selectedSeats)=>{
    try{
const showData= await Show.findById(showId)
if(!showData)
    return false;
const occupiedSeats = showData.occupiedSeats;

const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
return !isAnySeatTaken;

    }catch(error){
console.log(error.message);
return false;
    }
}

export const createBooking = async(req,res)=>{
    try{
        const {userId} = req.auth();
        const{showId,selectedSeats} = req.body;
        const {origin} = req.headers;

        //check if the seat is available for theselected show

        const isAvailable = await checkSeatsAvailabilty(showId,selectedSeats)

        if(!isAvailable){
            return res.json({success:false,message:"Selected Seats are not available."})
        }

//get the show details 
const showData = await Show.findById(showId).populate('movie');

//create a new booking 
const booking = await Booking.create({
    user:userId,
    show:showId,
    amount:showData.showPrice * selectedSeats.length,
    bookedSeats:selectedSeats
})

selectedSeats.map(()=>{
    showData.occupiedSeats[seat] = userId;
})
showData.markModified('occupiedSeats');

await showData.save();

//stripe Gateway Initilize

res.json({success:true,message:'Booked Suucessfully '})
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

export const getOccupiedSeats= async (req,res)=>{
    try{
const {showId} = req.params;
const showData = await Show.findById(showId)
const occupiedSeats = Object.keys(showData.occupiedSeats)

res.json({success:true,occupiedSeats})
    } catch (error){
console.log(error.message);
res.json({success:false,message:error.message})
    }
}
