import Message from '../models/Message.js';
import User from '../models/User.js';
import imagekit from '../configs/imagekit.js';
import { addClient, removeClient, sendSseEvent } from '../utils/sse.js';

// Controller for establishing and managing the real-time stream
export const sseController = (req, res) => {
    const { userId } = req.auth();
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    addClient(userId, res);
    req.on('close', () => removeClient(userId));
};

// Controller for sending a message
export const sendMessage = async (req, res, next) => {
    try {
        const { userId: fromUserId } = req.auth();
        const { to_user_id, text } = req.body;
        let mediaUrl = '', messageType = 'text';

        if (req.file) {
            const response = await imagekit.upload({ file: req.file.buffer, fileName: `message_${fromUserId}_${Date.now()}`, folder: '/messages' });
            mediaUrl = response.url;
            messageType = 'image';
        }

        if (!text && !mediaUrl) {
            return res.status(400).json({ success: false, message: "Message cannot be empty." });
        }

        const newMessage = await Message.create({ from_user_id: fromUserId, to_user_id, text: text || '', media_url: mediaUrl, message_type: messageType });
        const populatedMessage = await Message.findById(newMessage._id).populate([{ path: 'from_user_id', select: 'full_name profile_picture _id' }, { path: 'to_user_id', select: 'full_name profile_picture _id' }]);

        // ✅ FIXED: Send a named 'newMessage' event using the SSE utility
        sendSseEvent(to_user_id, 'newMessage', populatedMessage);

        res.status(201).json({ success: true, message: populatedMessage });
    } catch (error) {
        next(error);
    }
};

// Controller for getting the list of conversations
export const getConversations = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const conversations = await Message.aggregate([
            { $match: { $or: [{ from_user_id: userId }, { to_user_id: userId }] } },
            { $sort: { createdAt: -1 } },
            { $group: {
                _id: { $cond: [{ $eq: ["$from_user_id", userId] }, "$to_user_id", "$from_user_id"] },
                lastMessage: { $first: "$$ROOT" }
            }},
            { $replaceRoot: { newRoot: "$lastMessage" } },
            { $sort: { createdAt: -1 } }
        ]);
        await User.populate(conversations, { path: 'from_user_id to_user_id', select: 'full_name profile_picture username' });
        res.json({ success: true, conversations });
    } catch (error) {
        next(error);
    }
};

// Controller for getting the chat history with one user
export const getChatMessages = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { otherUserId } = req.params;
        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id: otherUserId },
                { from_user_id: otherUserId, to_user_id: userId }
            ]
        }).sort({ createdAt: 'asc' });
        res.json({ success: true, messages });
    } catch (error) {
        next(error);
    }
};