import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { serve } from 'inngest/express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { clerkMiddleware } from "@clerk/express";

import connectDB from './configs/db.js';
import { inngest, functions } from './inngest/index.js';
import userRouter from './routes/userRouter.js';
import postRouter from './routes/postRouter.js'; // Ensure this filename is correct
import storyRoutes from "./routes/storyRouter.js";
import messageRouter from './routes/messageRouter.js';

const app = express();

try {
  await connectDB();
} catch (error) {
  console.error("Failed to connect to DB:", error);
  process.exit(1);
}

app.use(clerkMiddleware());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// Routes
app.get('/', (req, res) => res.send('Server is running'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use("/api/story", storyRouter);
app.use('/api/message', messageRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));