// src/routes/messageRouter.js

import express from 'express';
import {
    getChatMessages,
    getConversations,
    sendMessage,
    sseController
} from '../controllers/MessageController.js';
import { upload } from '../middlewares/multer.js';
import { clerkProtect } from '../middlewares/auth.js';

const messageRouter = express.Router();

// Middleware to get the token from the query for the SSE connection
const sseAuthMiddleware = (req, res, next) => {
    const { token } = req.query;
    if (token) {
        req.headers.authorization = `Bearer ${token}`;
    }
    next();
};

// All routes are now protected by the standard clerkProtect middleware
messageRouter.get('/stream', sseAuthMiddleware, clerkProtect, sseController);
messageRouter.get('/conversations', clerkProtect, getConversations);
messageRouter.get('/chat/:otherUserId', clerkProtect, getChatMessages);
messageRouter.post('/send', clerkProtect, upload.single('image'), sendMessage);

export default messageRouter;