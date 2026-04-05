import Show from "../models/Show.js"
import Booking from "../models/Booking.js";
import Stripe from 'stripe'
import { inngest } from "../inngest/index.js";
import { getAuthUserId } from "../middleware/auth.js";


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
        const userId = getAuthUserId(req);
        const{showId,selectedSeats} = req.body;
        const clientBaseUrl = process.env.CLIENT_URL || req.headers.origin;

        if (!showId || !Array.isArray(selectedSeats) || !selectedSeats.length) {
            return res.status(400).json({ success: false, message: "showId and selectedSeats are required." })
        }

        if (selectedSeats.length > 5) {
            return res.status(400).json({ success: false, message: "You can only book up to 5 seats." })
        }

        //check if the seat is available for theselected show

        const isAvailable = await checkSeatsAvailabilty(showId,selectedSeats)

        if(!isAvailable){
            return res.json({success:false,message:"Selected Seats are not available."})
        }

//get the show details 
const showData = await Show.findById(showId).populate('movie');

if (!showData || !showData.movie) {
    return res.status(404).json({ success: false, message: "Show not found." })
}

//create a new booking 
const booking = await Booking.create({
    user:userId,
    show:showId,
    amount:showData.showPrice * selectedSeats.length,
    bookedSeats:selectedSeats,
    isPaid:false,
})

selectedSeats.forEach((seat)=>{
    showData.occupiedSeats[seat] = userId;
})
showData.markModified('occupiedSeats');

await showData.save();

//stripe Gateway Initilize
if (!process.env.STRIPE_SECRET_KEY || !clientBaseUrl) {
    return res.status(500).json({ success: false, message: "Payment configuration is incomplete." })
}

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

//CREATING LINE ITEMS TO FOE STRIPE
const line_items =[{
    price_data: {
        currency: 'usd',
        product_data:{
            name:showData.movie.title
        },
        unit_amount: Math.floor(booking.amount)*100
    },
    quantity: 1
}]

const session = await stripeInstance.checkout.sessions.create({
    success_url:`${clientBaseUrl}/loading/my-bookings`,
    cancel_url:`${clientBaseUrl}/my-bookings`,
    line_items:line_items,
    mode:'payment',
    metadata: {
        bookingId :booking._id.toString()
    },
    expires_at:Math.floor(Date.now()/1000)+ 30 * 60 , //expire in 30 min 
})

booking.paymentLink= session.url
await booking.save()

// Run Inngest sheduler function to check payment status after 10 minutes
await inngest.send({
    name:"app/checkpayment",
    data:{
        bookingId: booking._id.toString()
    }
})
res.json({success:true,url:session.url})
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

export const getOccupiedSeats= async (req,res)=>{
    try{
const {showId} = req.params;
const showData = await Show.findById(showId)
if (!showData) {
    return res.status(404).json({ success: false, message: "Show not found." })
}
const occupiedSeats = Object.keys(showData.occupiedSeats)

res.json({success:true,occupiedSeats})
    } catch (error){
console.log(error.message);
res.json({success:false,message:error.message})
    }
}
