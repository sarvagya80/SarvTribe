import express from 'express';
import { getChatMessages, sendMessage, sseController } from '../controllers/Messagecontroller.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';

const messageRouter = express.Router();

// SSE for live chat updates
messageRouter.get('/:userId', sseController);

// Send a new message
messageRouter.post('/send', upload.single('image'), protect, sendMessage);

// Get chat messages between users
messageRouter.post('/get', protect, getChatMessages);

export default messageRouter;