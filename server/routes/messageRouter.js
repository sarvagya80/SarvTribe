// routes/messageRoutes.js
import express from 'express';
import {
    getChatMessages,
    getConversations,
    sendMessage,
    sseController
} from '../controllers/messagecontroller.js';
import { upload } from '../middlewares/multer.js';
// ✅ CHANGED: Import 'verifyToken' in addition to 'clerkProtect'
import { clerkProtect, verifyToken } from '../middlewares/auth.js';

const messageRouter = express.Router();

// This middleware to get the token from the query is still correct.
const sseAuthMiddleware = (req, res, next) => {
    const { token } = req.query;
    if (token) {
        req.headers.authorization = `Bearer ${token}`;
    }
    next();
};

// ✅ CHANGED: Use 'verifyToken' for the stream instead of 'clerkProtect'
messageRouter.get('/stream', sseAuthMiddleware, verifyToken, sseController);

// All other routes correctly use the standard 'clerkProtect'
messageRouter.get('/conversations', clerkProtect, getConversations);
messageRouter.get('/chat/:otherUserId', clerkProtect, getChatMessages);
messageRouter.post('/send', clerkProtect, upload.single('image'), sendMessage);

export default messageRouter;