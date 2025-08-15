import express from 'express';
import { getChatMessages, sendMessage, sseController } from '../controllers/Messagecontroller.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';

const messageRouter = express.Router();

// SSE for live chat updates
// CRITICAL: Added 'protect' middleware to secure this endpoint
messageRouter.get('/:userId', protect, sseController);

// Send a new message
messageRouter.post(
    '/send',
    protect, // 1. Authenticate first
    upload.single('image'), // 2. Then process the upload
    sendMessage
);

// Get chat messages between users
messageRouter.post('/get', protect, getChatMessages);

export default messageRouter;