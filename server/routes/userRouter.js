// src/routes/userRouter.js

import express from 'express';
import {
    acceptConnectionRequest, // 👈 1. Make sure this is imported
    discoverUsers,
    followUser,
    getMe,
    getUserNetwork,
    getUserProfile,
    sendConnectionRequest,
    unfollowUser,
    updateUserData,
} from '../controllers/userController.js';
import { clerkProtect } from '../middlewares/auth.js';
import { upload } from '../middlewares/multer.js';

const userRouter = express.Router();

// --- Specific routes first ---
userRouter.get('/me', clerkProtect, getMe);
userRouter.get('/network', clerkProtect, getUserNetwork);

// --- Action routes ---
userRouter.patch(
    '/update',
    clerkProtect,
    upload.fields([
        { name: 'profile', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]),
    updateUserData
);
userRouter.post('/discover', clerkProtect, discoverUsers);
userRouter.post('/follow', clerkProtect, followUser);
userRouter.post('/unfollow', clerkProtect, unfollowUser);
userRouter.post('/connect/send', clerkProtect, sendConnectionRequest);
userRouter.post('/connect/accept', clerkProtect, acceptConnectionRequest); // 👈 2. Add this line

// --- Generic routes with parameters last ---
userRouter.get('/:profileId', clerkProtect, getUserProfile);

export default userRouter;