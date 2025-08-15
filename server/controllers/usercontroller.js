import mongoose from 'mongoose';
import imagekit from '../configs/imagekit.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { inngest } from '../inngest/index.js';

// --- PROFILE & DATA ---
export const createProfileOnFirstLogin = async (req, res, next) => {
    try {
        console.log("--- RUNNING DATABASE BYPASS TEST ---");
        const { userId, sessionClaims } = req.auth();

        // Create a fake user object instead of calling the database
        const fakeUser = {
            _id: userId,
            email: sessionClaims.email,
            full_name: `${sessionClaims.firstName || ''} ${sessionClaims.lastName || ''}`.trim(),
            profile_picture: sessionClaims.imageUrl,
            username: sessionClaims.username || "testuser",
            followers: [],
            following: [],
            connections: [],
        };

        // Immediately send the fake user as a response
        res.json({ success: true, user: fakeUser });
        console.log("--- TEST FINISHED: FAKE RESPONSE SENT ---");

    } catch (error) {
        console.error("---! ERROR IN BYPASS TEST !---", error);
        next(error);
    }
};


export const getUserData = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found in database.' });
        }
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

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
            const response = await imagekit.upload({ file: profile.buffer, fileName: profile.originalname });
            updatedData.profile_picture = response.url;
        }
        if (cover) {
            const response = await imagekit.upload({ file: cover.buffer, fileName: cover.originalname });
            updatedData.cover_photo = response.url;
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updatedData }, { new: true });
        res.json({ success: true, user, message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const getUserProfiles = async (req, res, next) => {
    try {
        const { profileId } = req.params; // Correctly read from req.params
        const profile = await User.findById(profileId);
        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }
        const posts = await Post.find({ user: profileId }).populate('user');
        res.json({ success: true, profile, posts });
    } catch (error) {
        next(error);
    }
};

export const discoverUsers = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { input } = req.body;
        const searchRegex = new RegExp(input, 'i');

        const allUsers = await User.find({
            $or: [
                { username: searchRegex },
                { full_name: searchRegex },
                { location: searchRegex },
            ]
        });
        const filteredUsers = allUsers.filter(user => user._id !== userId);
        res.json({ success: true, users: filteredUsers });
    } catch (error) {
        next(error);
    }
};

// --- FOLLOW / UNFOLLOW ---

export const followUser = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId } = req.auth(); // Use function call
        const { id: targetUserId } = req.body;
        
        if (userId === targetUserId) throw new Error("You cannot follow yourself.");

        const currentUser = await User.findById(userId).session(session);
        const targetUser = await User.findById(targetUserId).session(session);

        if (!targetUser) throw new Error("User not found.");
        if (currentUser.following.includes(targetUserId)) throw new Error('You are already following this user.');

        currentUser.following.push(targetUserId);
        targetUser.followers.push(userId);

        await currentUser.save({ session });
        await targetUser.save({ session });

        await session.commitTransaction();
        res.json({ success: true, message: 'User followed successfully' });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const unfollowUser = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId } = req.auth();
        const { id: targetUserId } = req.body;

        const currentUser = await User.findById(userId).session(session);
        const targetUser = await User.findById(targetUserId).session(session);

        currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
        
        await currentUser.save({ session });
        await targetUser.save({ session });

        await session.commitTransaction();
        res.json({ success: true, message: 'Unfollowed user' });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// --- CONNECTIONS ---

export const sendConnectionRequest = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { id: targetUserId } = req.body;

        if (userId === targetUserId) throw new Error("You cannot connect with yourself.");

        const existingConnection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: targetUserId },
                { from_user_id: targetUserId, to_user_id: userId },
            ]
        });

        if (existingConnection) {
            return res.status(409).json({ success: false, message: 'A connection or request already exists.' });
        }

        const newConnection = await Connection.create({
            from_user_id: userId,
            to_user_id: targetUserId
        });

        await inngest.send({
            name: 'app/connection-request',
            data: { connectionId: newConnection._id.toString() }
        });
        res.status(201).json({ success: true, message: 'Connection request sent successfully' });
    } catch (error) {
        next(error);
    }
};

export const acceptConnectionRequest = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId } = req.auth();
        const { id: requesterId } = req.body;

        const connection = await Connection.findOne({
            from_user_id: requesterId,
            to_user_id: userId,
            status: 'pending'
        }).session(session);

        if (!connection) throw new Error('Connection request not found or already accepted.');

        const currentUser = await User.findById(userId).session(session);
        const requesterUser = await User.findById(requesterId).session(session);
        
        currentUser.connections.push(requesterId);
        requesterUser.connections.push(userId); // Corrected typo
        connection.status = 'accepted';

        await currentUser.save({ session });
        await requesterUser.save({ session });
        await connection.save({ session });

        await session.commitTransaction();
        res.json({ success: true, message: 'Connection request accepted' });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const getUserConnections = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId).populate('connections followers following');

        // --- ADD THIS CHECK ---
        if (!user) {
            return res.json({
                success: true,
                connections: [],
                followers: [],
                following: [],
                pendingConnections: []
            });
        }
        // --- END OF CHECK ---

        const pendingConnections = await Connection.find({ to_user_id: userId, status: 'pending' })
            .populate('from_user_id');

        res.json({
            success: true,
            connections: user.connections,
            followers: user.followers,
            following: user.following,
            pendingConnections: pendingConnections.map(conn => conn.from_user_id)
        });
    } catch (error) {
        next(error);
    }
};