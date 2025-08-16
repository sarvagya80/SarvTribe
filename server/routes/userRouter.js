// server/routes/userRoutes.js

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

// ✅ THIS IS THE KEY: Specific routes like '/me' and '/network' MUST come first.
userRouter.get('/me', clerkProtect, getMe);
userRouter.get('/network', clerkProtect, getUserNetwork);

// --- All other routes can follow ---
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
userRouter.post('/connect/accept', clerkProtect, acceptConnectionRequest);

// ✅ AND THIS IS KEY: Generic routes with parameters MUST come last.
userRouter.get('/:profileId', clerkProtect, getUserProfile);

export default userRouter;