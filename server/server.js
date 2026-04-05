import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRoutes from './routes/showRoutes.js'
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';


const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

await connectDB()
app.use((req, res, next) => {
  console.log("➡️ Incoming request:", req.method, req.url);
  next();
});
//Stripe webhooks route
app.use('/api/stripe',express.raw({type:'application/json'}),stripeWebhooks)

//Middleware
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}))
app.use(clerkMiddleware())

//API Routes
app.get('/' , (req,res)=>res.send('Server is Live!'))
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is healthy' }))
app.use('/api/inngest',serve({ client: inngest, functions }))
app.use('/api/show',showRoutes)

app.use('/api/booking',bookingRouter)
app.use('/api/admin',adminRouter)
app.use('/api/user',userRouter)

if (process.env.VERCEL !== '1') {
  app.listen(port,()=> console.log(`Server listening at http://localhost:${port}`));
}

export default app;
