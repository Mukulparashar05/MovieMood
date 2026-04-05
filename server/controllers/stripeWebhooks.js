import Stripe from "stripe";
import Booking from '../models/Booking.js'
import { inngest } from "../inngest/index.js";


export const stripeWebhooks = async (request,response)=>{
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
const sig = request.headers["stripe-signature"];


let event;

try{
    event = stripeInstance.webhooks.constructEvent(request.body,sig,process.env.STRIPE_WEBHOOK_SECRET)
}catch (error){
    return response.status(400).send(`Webhook Error : ${error.message}`)
}

try{
switch(event.type){
    case "checkout.session.completed":{
        const session = event.data.object;
        const {bookingId} = session.metadata;

        await Booking.findByIdAndUpdate(bookingId, {
            isPaid : true,
            paymentLink: ""
        })
//send confirmation email
await inngest.send({
    name:"app/show.booked",
    data:{bookingId}
})


         break;
    }

default:
  console.log('Unhandled event type :',event.type)
   }
   response.json({received:true})
}catch(err){

    console.error('Webhook processing error:',err);
    response.status(500).send("Internal Server Error");

}
}
