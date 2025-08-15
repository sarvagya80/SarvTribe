import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
// --- New imports for professional polish ---
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Local Imports
import connectDB from './configs/db.js';
import { inngest, functions } from './inngest/index.js';
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messageRoutes.js';

console.log("Clerk Publishable Key from .env:", process.env.CLERK_PUBLISHABLE_KEY);

const app = express();

// --- Graceful DB Connection ---
try {
    await connectDB();
} catch (error) {
    console.error("Failed to connect to the database. Server not started.", error);
    process.exit(1);
}

// --- CORS Configuration ---
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
};

// --- Security & Logging Middlewares ---
app.use(helmet()); // Set security-related HTTP response headers
app.use(morgan('dev')); // Log HTTP requests in development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter); // Apply the rate limiting to all API routes

// --- Core Middlewares ---
app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use(cors(corsOptions));
app.use(clerkMiddleware());

// --- API Routes ---
app.get('/', (req, res) => res.send('Server is running'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/story', storyRouter);
app.use('/api/message', messageRouter);

// --- Custom 404 Handler ---
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: "API route not found." });
});

// --- Centralized Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));