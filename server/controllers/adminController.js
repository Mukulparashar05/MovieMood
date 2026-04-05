
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

//Api to check if user is admin 
export const isAdmin = async(req,res) =>{
 res.json({success:true,isAdmin:true})
}





//API to get dashboard data
export const getDashboardData = async(req,res) =>{
    try{
const bookings = await Booking.find({isPaid:true});
const activeShows = await Show.find({showDateTime:{$gte:new Date()}}).populate('movie');
const totalUser = await User.countDocuments();

const dashboardData = {
    totalBookings:bookings.length,
    totalRevenue: bookings.reduce((acc,booking)=>acc+booking.amount,0),
    activeShows,
    totalUser
}
res.json({success:true,dashboardData})
    } catch(error){
console.log(error);
res.json({success:false,message:error.message})
    }
}

//API to get all shows
export const getAllShows = async (req,res)=>{
    try{
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDateTime:1})
        res.json({success:true,shows})
    }catch(error){
        console.error(error);
        res.json({success:false,message:error.message})
    }
}

//API to get all bookings
export const getAllBookings = async (req,res) =>{
    try{
        const bookings = await Booking.find({}).populate({
            path:'show',
            populate:{path:'movie'}
        }).sort({createdAt:-1})

        const normalizedBookings = await Promise.all(
            bookings.map(async (booking) => {
                const userId = booking.user?.toString?.() || booking.user;
                let normalizedUser = null;

                const localUser = await User.findById(userId).lean();

                if (localUser) {
                    normalizedUser = localUser;
                } else {
                    try {
                        const clerkUser = await clerkClient.users.getUser(userId);
                        normalizedUser = {
                            _id: clerkUser.id,
                            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'Unknown User',
                            email: clerkUser.primaryEmailAddress?.emailAddress || '',
                        };
                    } catch (error) {
                        normalizedUser = {
                            _id: userId,
                            name: 'Unknown User',
                            email: '',
                        };
                    }
                }

                return {
                    ...booking.toObject(),
                    user: normalizedUser,
                };
            })
        );

        res.json({success:true,bookings: normalizedBookings})
    }catch (error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}
