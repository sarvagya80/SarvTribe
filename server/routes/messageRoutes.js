// routes/messageRoutes.js
import express from 'express';
import {
    getChatMessages,
    getConversations,
    sendMessage,
    sseController
} from '../controllers/messageController.js';
import { upload } from '../middlewares/multer.js';
import { clerkProtect } from '../middlewares/auth.js';

const messageRouter = express.Router();

// Middleware to handle token from query parameter for SSE
const sseAuthMiddleware = (req, res, next) => {
    const { token } = req.query;
    if (token) {
        // Attach the token as a Bearer token in the headers
        req.headers.authorization = `Bearer ${token}`;
    }
    next();
};

// 🔒 Establish SSE connection (using the new middleware first)
messageRouter.get('/stream', sseAuthMiddleware, clerkProtect, sseController);

// 🔒 Get a list of all conversations for the logged-in user
messageRouter.get('/conversations', clerkProtect, getConversations);

// 🔒 Get the chat history with a specific user
messageRouter.get('/chat/:otherUserId', clerkProtect, getChatMessages);

// 🔒 Send a new message
messageRouter.post('/send', clerkProtect, upload.single('image'), sendMessage);

export default messageRouter;