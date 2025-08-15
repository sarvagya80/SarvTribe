import express from 'express';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';
import { addPost, getFeedPosts, likePost } from '../controllers/postcontroller.js';

const postRouter = express.Router();

// Route to add a new post
postRouter.post(
    '/add',
    protect, // 1. Authenticate first
    upload.array('images', 4), // 2. Then process up to 4 images
    addPost
);

// Route to get the user's feed
postRouter.get('/feed', protect, getFeedPosts);

// Route to like/unlike a post
postRouter.post('/like', protect, likePost);

export default postRouter;