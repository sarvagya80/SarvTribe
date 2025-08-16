import express from 'express';
import {
    acceptConnectionRequest,
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

// 🔒 Get the logged-in user's own profile data
userRouter.get('/me', clerkProtect, getMe);

// 🔒 Update the logged-in user's profile
userRouter.patch( // Using PATCH for partial updates is more conventional
    '/update',
    clerkProtect,
    upload.fields([
        { name: 'profile', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]),
    updateUserData
);

// 🔒 Discover other users via search
userRouter.post('/discover', clerkProtect, discoverUsers);

// 🔒 Follow and unfollow users
userRouter.post('/follow', clerkProtect, followUser);
userRouter.post('/unfollow', clerkProtect, unfollowUser);

// 🔒 Manage connection requests
userRouter.post('/connect/send', clerkProtect, sendConnectionRequest);
userRouter.post('/connect/accept', clerkProtect, acceptConnectionRequest);

// 🔒 Get the user's entire network (connections, followers, etc.)
userRouter.get('/network', clerkProtect, getUserNetwork);

// ✅ Public route to view any user's profile
userRouter.get('/:profileId', getUserProfile);

export default userRouter;