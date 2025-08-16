import mongoose from 'mongoose';
import imagekit from '../configs/imagekit.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { inngest } from '../inngest/index.js';

// Get logged-in user data
export const getMe = async (req, res, next) => {
    try {
        // ✅ CORRECTED to use req.auth()
        const { userId } = req.auth();
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found in database. Sync may be in progress.' });
        }
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// Update user data
export const updateUserData = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { username, bio, location, full_name } = req.body;
        const updatedData = { bio, location, full_name };

        if (username) {
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(409).json({ success: false, message: 'Username is already taken.' });
            }
            updatedData.username = username;
        }

        const profile = req.files?.profile?.[0];
        const cover = req.files?.cover?.[0];

        if (profile) {
            const response = await imagekit.upload({ file: profile.buffer, fileName: `profile_${userId}`, folder: 'avatars' });
            updatedData.profile_picture = response.url;
        }
        if (cover) {
            const response = await imagekit.upload({ file: cover.buffer, fileName: `cover_${userId}`, folder: 'covers' });
            updatedData.cover_photo = response.url;
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updatedData }, { new: true });
        res.json({ success: true, user, message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Get user profile by ID
export const getUserProfile = async (req, res, next) => {
    try {
        const { profileId } = req.params;
        const profile = await User.findById(profileId).lean();

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        const [posts, postsCount] = await Promise.all([
            Post.find({ user: profileId }).populate('user'),
            Post.countDocuments({ user: profileId })
        ]);

        profile.postsCount = postsCount;

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
        const searchRegex = new RegExp(input, 'i');

        const users = await User.find({
            _id: { $ne: userId },
            $or: [
                { username: searchRegex },
                { full_name: searchRegex },
                { location: searchRegex },
            ]
        });
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

        const newConnection = await Connection.create({
            from_user_id: userId,
            to_user_id: targetUserId
        });

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

// Get a user's connections, followers, and pending requests
export const getUserNetwork = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId).populate('connections followers following');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const pendingRequests = await Connection.find({ to_user_id: userId, status: 'pending' })
            .populate('from_user_id', 'full_name username profile_picture');

        res.json({
            success: true,
            connections: user.connections,
            followers: user.followers,
            following: user.following,
            pendingRequests
        });
    } catch (error) {
        next(error);
    }
};