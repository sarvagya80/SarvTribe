import express from 'express';
// Import all the "brain" functions from your controller
import {
    acceptConnectionRequest,
    discoverUsers,
    followUser,
    getUserConnections,
    getUserData,
    sendConnectionRequest,
    unfollowUser,
    updateUserData,
    getUserProfiles,
    createProfileOnFirstLogin // <-- Import your function
} from '../controllers/usercontroller.js'; 
import { protect } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';
import { getUserRecentMessages } from '../controllers/Messagecontroller.js';

const userRouter = express.Router();

// Get data for the currently authenticated user
userRouter.get('/data', protect, getUserData);

// Update the current user's profile
userRouter.post(
    '/update',
    protect, 
    upload.fields([
        { name: 'profile', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]),
    updateUserData
);

// Search for other users
userRouter.post('/discover', protect, discoverUsers);

// Follow/Unfollow actions
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);

// Connection management
userRouter.post('/connect', protect, sendConnectionRequest);
userRouter.post('/accept', protect, acceptConnectionRequest);
userRouter.get('/connections', protect, getUserConnections); 

// Get another user's profile using the imported function
userRouter.get('/profiles/:profileId', getUserProfiles);

// ... other imports and routes
userRouter.post('/create-profile', protect, createProfileOnFirstLogin);

// Get recent messages for the sidebar
userRouter.get('/recent-messages', protect, getUserRecentMessages);

export default userRouter;