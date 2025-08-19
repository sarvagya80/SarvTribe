import mongoose from 'mongoose';
import imagekit from '../configs/imagekit.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { inngest } from '../inngest/index.js';

// Get logged-in user data
export const getMe = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found in database.' });
        }
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// Update user data
// ... (keep all your other controller functions)

export const updateUserData = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { full_name, username, bio, location } = req.body;
        const updates = { full_name, username, bio, location };

        if (req.files) {
            if (req.files.profile) {
                const response = await imagekit.upload({ file: req.files.profile[0].buffer, fileName: `profile_${userId}`, folder: 'avatars' });
                updates.profile_picture = response.url;
            }
            if (req.files.cover) {
                const response = await imagekit.upload({ file: req.files.cover[0].buffer, fileName: `cover_${userId}`, folder: 'covers' });
                updates.cover_photo = response.url;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        // This is the successful response the frontend will receive
        res.status(200).json({ success: true, message: "Profile updated successfully!", user: updatedUser });
    } catch (error) {
        next(error);
    }
};

// Get user profile by ID
export const getUserProfile = async (req, res, next) => {
    try {
        const { profileId } = req.params;
        const profile = await User.findById(profileId).lean(); // .lean() for performance
        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        const posts = await Post.find({ user: profileId }).sort({ createdAt: -1 });
        profile.postsCount = posts.length; // Attach post count

        res.json({ success: true, profile, posts });
    } catch (error) {
        next(error);
    }
};

// Discover users by search input
export const discoverUsers = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { input } = req.body;
        if (!input) {
            return res.json({ success: true, users: [] });
        }
        const searchRegex = new RegExp(input, 'i');
        const users = await User.find({
            _id: { $ne: userId },
            $or: [
                { username: searchRegex },
                { full_name: searchRegex },
            ]
        }).limit(10); // Add a limit for performance
        res.json({ success: true, users });
    } catch (error) {
        next(error);
    }
};

// Follow a user
export const followUser = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId } = req.auth();
        const { targetUserId } = req.body;
        if (userId === targetUserId) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself." });
        }
        await User.findByIdAndUpdate(userId, { $addToSet: { following: targetUserId } }, { session });
        await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: userId } }, { session });
        await session.commitTransaction();
        res.json({ success: true, message: 'User followed successfully' });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// Unfollow a user
export const unfollowUser = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId } = req.auth();
        const { targetUserId } = req.body;
        await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } }, { session });
        await User.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } }, { session });
        await session.commitTransaction();
        res.json({ success: true, message: 'Unfollowed user successfully' });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// Send a connection request
export const sendConnectionRequest = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { targetUserId } = req.body;
        if (userId === targetUserId) {
            return res.status(400).json({ success: false, message: "You cannot connect with yourself." });
        }
        const existingConnection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: targetUserId },
                { from_user_id: targetUserId, to_user_id: userId },
            ]
        });
        if (existingConnection) {
            return res.status(409).json({ success: false, message: 'A connection or pending request already exists.' });
        }
        const newConnection = await Connection.create({ from_user_id: userId, to_user_id: targetUserId });
        await inngest.send({
            name: 'app/connection-request',
            data: { connectionId: newConnection._id.toString() }
        });
        res.status(201).json({ success: true, message: 'Connection request sent' });
    } catch (error) {
        next(error);
    }
};

// Accept a connection request
export const acceptConnectionRequest = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId } = req.auth();
        const { requesterId } = req.body;
        const connection = await Connection.findOneAndUpdate(
            { from_user_id: requesterId, to_user_id: userId, status: 'pending' },
            { status: 'accepted' },
            { new: true, session }
        );
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection request not found or already accepted.' });
        }
        await User.findByIdAndUpdate(userId, { $addToSet: { connections: requesterId } }, { session });
        await User.findByIdAndUpdate(requesterId, { $addToSet: { connections: userId } }, { session });
        await session.commitTransaction();
        res.json({ success: true, message: 'Connection request accepted' });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// Get a user's network (connections, followers, etc.)
export const getUserNetwork = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        // Use Promise.all for parallel database queries
        const [user, pendingRequests] = await Promise.all([
            User.findById(userId).populate([
                { path: 'connections', select: 'full_name username profile_picture bio' },
                { path: 'followers', select: 'full_name username profile_picture bio' },
                { path: 'following', select: 'full_name username profile_picture bio' }
            ]),
            Connection.find({ to_user_id: userId, status: 'pending' })
                .populate('from_user_id', 'full_name username profile_picture bio')
        ]);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({
            success: true,
            connections: user.connections,
            followers: user.followers,
            following: user.following,
            pendingRequests: pendingRequests.map(req => req.from_user_id) // Simplify the structure
        });
    } catch (error) {
        next(error);
    }
};