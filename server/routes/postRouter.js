// src/routes/postRouter.js (No Changes Needed)

import express from 'express';
import { upload } from '../middlewares/multer.js';
import { clerkProtect } from '../middlewares/auth.js';
import { createPost, getFeedPosts, likeUnlikePost , createComment,
    getCommentsForPost } from '../controllers/postController.js';

const postRouter = express.Router();

postRouter.get('/feed', clerkProtect, getFeedPosts);
postRouter.post('/create', clerkProtect, upload.array('images', 4), createPost);
postRouter.patch('/:postId/like', clerkProtect, likeUnlikePost);
postRouter.post('/:postId/comment', clerkProtect, createComment);
postRouter.get('/:postId/comments', clerkProtect, getCommentsForPost);

export default postRouter;