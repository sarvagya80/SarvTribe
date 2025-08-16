// server/routes/postRouter.js
import express from 'express';
import { upload } from '../middlewares/multer.js';
import { clerkProtect } from '../middlewares/auth.js';

// ✅ THIS IMPORT MUST EXACTLY MATCH YOUR FILE/FOLDER NAMES
import { createPost, getFeedPosts, likeUnlikePost } from '../controllers/postcontroller.js';

const postRouter = express.Router();

// 🔒 Get personalized feed posts (requires login)
postRouter.get('/feed', clerkProtect, getFeedPosts);

// 🔒 Create a new post
postRouter.post('/', clerkProtect, upload.array('images', 4), createPost);

// 🔒 Like or unlike a specific post
postRouter.patch('/:postId/like', clerkProtect, likeUnlikePost);

export default postRouter;