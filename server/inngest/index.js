import { Inngest } from "inngest";
import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodemailer.js";

//Create a client to send and receive events 
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }

        await User.create(userData)
    }

)
//Inngest fxn to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {

        const { id } = event.data
        await User.findByIdAndDelete(id)
    }

)
//Inngest fxn to update user in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-with-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData)
    }

)

//Inngest Function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made

const releaseSeatsAndDeleteBooking = inngest.createFunction(
    { id: 'release-seats-delete-booking' },
    { event: "app/checkpayment" },
    async ({ event, step }) => {
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);
        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)
            if (!booking) {
                return;
            }
            // If payment is not made release seats and delete booking
            if (!booking.isPaid) {
                const show = await Show.findById(booking.show);
                if (!show) {
                    await Booking.findByIdAndDelete(booking._id)
                    return;
                }
                booking.bookedSeats.forEach((seat) => {
                    delete show.occupiedSeats[seat]
                });
                show.markModified('occupiedSeats')
                await show.save()
                await Booking.findByIdAndDelete(booking._id)
            }
        })
    }
)


// inngest function to sebd email when user book a show
const sendBookingConfirmationEmail = inngest.createFunction(
    {id: "send-booking-confirmation-email"},
    {event: "app/show.booked"},
    async ({ event }) =>{
        const {bookingId} = event.data;
        const booking = await Booking.findById(bookingId).populate({
            path:'show',
            populate: {path:"movie",model:"Movie"}
        });

        if (!booking?.show?.movie) {
            return;
        }

        const localUser = await User.findById(booking.user).lean();
        let bookingUser = localUser;

        if (!bookingUser) {
            try {
                bookingUser = await clerkClient.users.getUser(booking.user?.toString?.() || booking.user);
            } catch (error) {
                console.error('Unable to resolve Clerk user for booking email', error.message);
                return;
            }
        }

        const recipientEmail = bookingUser.email || bookingUser.primaryEmailAddress?.emailAddress;
        const recipientName = bookingUser.name || `${bookingUser.firstName || ''} ${bookingUser.lastName || ''}`.trim() || 'there';

        if (!recipientEmail) {
            return;
        }

        await sendEmail({
            to:recipientEmail,
            subject:`Payment Confirmation: "${booking.show.movie.title}" booked!`,
            body: `
            <h2>Hi ${recipientName}, </h2>
            <p>Your booking is confirmed.</p>
            <p>Movie: ${booking.show.movie.title}</p>
            <p>Show time: ${booking.show.showDateTime.toLocaleString()}</p>
            <p>Seats: ${booking.bookedSeats.join(', ')}</p>
            `
        })
    }
)
//inngest function to send reminder
const sendShowReminders = inngest.createFunction(
    {id: "send-show-reminders"},
    { cron: "0 */8 * * *"},//   Every 8 hours
    async({step})=>{
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 8*60*60*1000);
        const windowStart = new Date(in8Hours.getTime()- 10*60*1000);

        //prepare reminder tasks
        const reminderTasks = await step.run
        ("prepare-reminder-tasks",async ()=>{
            const shows = await Show.find({
                showDateTime: {$gte:windowStart,$lte:in8Hours},
            }).populate('movie');
            const tasks = [];
            for(const show of shows){
                if(!show.movie || !show.occupiedSeats) continue;

                const userIds = [...new Set(Object.values(show.occupiedSeats))];
                if(userIds.length ===0)continue;
                const users = await User.find({_id: {$in:userIds}}).select("name email");

                for(const user of users){
                    tasks.push({
                        userEmail :user.email,
                        userName: user.name,
                        movieTitle:show.movie.title,
                        showTime: show.showDateTime,
                    })
                }
            }
            return tasks;
        })
        if(reminderTasks.length === 0){
            return {sent:0,message:"No reminder to send."}
        }
        // Send reminder emails
        const results = await step.run('send-all-reminders',async ()=>{
return await Promise.allSettled(
    reminderTasks.map(task =>sendEmail({
        to:task.userEmail,
        subject:`Reminder: your movie "${task.movieTitle}" starts soon!`,
        body: `
            <h2>Hi ${task.userName},</h2>
            <p>This is a reminder that your movie "${task.movieTitle}" starts at ${task.showTime.toLocaleString()}.</p>
        `
    })
    )
)})
        return {
            sent: results.filter((result) => result.status === 'fulfilled').length,
        }
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation,releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail, sendShowReminders
];
