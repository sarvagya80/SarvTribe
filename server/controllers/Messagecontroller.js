import imagekit from "../configs/imagekit.js";
import Message from "../models/Message.js";

// Store SSE connections by userId. NOTE: This works for a single server instance.
const connections = {};

// Controller function for the SSE endpoint
export const sseController = (req, res) => {
    const { userId: paramUserId } = req.params;
    const { userId: authUserId } = req.auth(); // Get the ID of the logged-in user

    // --- FINAL SECURITY CHECK ---
    // Ensure the authenticated user can only subscribe to their own feed
    if (paramUserId !== authUserId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    console.log(`SSE client connected: ${authUserId}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // The global cors middleware in server.js already handles the origin.
    // This explicit header is not strictly necessary but doesn't hurt.

    connections[authUserId] = res;
    res.write('data: Connected to SSE stream\n\n');

    req.on('close', () => {
        console.log(`SSE client disconnected: ${authUserId}`);
        delete connections[authUserId];
    });
};

export const sendMessage = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Corrected
        const { to_user_id, text } = req.body;
        const image = req.file;

        let media_url = "";
        const message_type = image ? "image" : "text";

        if (image) {
            const response = await imagekit.upload({
                file: image.buffer, // Corrected
                fileName: image.originalname,
            });
            media_url = response.url;
        }

        // Corrected variable name
        const newMessage = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url,
        });
        
        // --- REAL-TIME PUSH LOGIC ---
        const recipientConnection = connections[to_user_id];
        if (recipientConnection) {
            console.log(`Pushing message to recipient: ${to_user_id}`);
            // Format the data as an SSE message
            recipientConnection.write(`data: ${JSON.stringify(newMessage)}\n\n`);
        }
        // --- END REAL-TIME LOGIC ---

        res.status(201).json({ success: true, message: newMessage });

    } catch (error) {
        next(error); // Use central error handler
    }
};

export const getChatMessages = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Corrected
        const { to_user_id } = req.body;

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId },
            ],
        }).sort({ createdAt: 1 }); // Sort oldest to newest for chat history

        // Mark received messages as seen
        await Message.updateMany(
            { from_user_id: to_user_id, to_user_id: userId, seen: false },
            { seen: true }
        );

        res.json({ success: true, messages });
    } catch (error) {
        next(error); // Use central error handler
    }
};

export const getUserRecentMessages = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Corrected

        // This query is for the "Recent Messages" list, which should show messages sent TO the user.
        // For a true conversation list, this logic would be more complex.
        const messages = await Message.find({ to_user_id: userId })
            .populate('from_user_id', 'full_name username profile_picture')
            .sort({ createdAt: -1 }); // Newest first is correct here

        res.json({ success: true, messages });
    } catch (error) {
        next(error); // Use central error handler
    }
};
