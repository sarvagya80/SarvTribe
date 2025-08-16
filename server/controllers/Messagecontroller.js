import Message from "../models/Message.js";
import imagekit from "../configs/imagekit.js";

/*
================================================================================
IMPORTANT NOTE ON REAL-TIME MESSAGING:
The Server-Sent Events (SSE) implementation below uses a simple in-memory object
to store connections. This WILL NOT WORK in a production environment with
multiple server instances (like Heroku, Vercel, or any load-balanced setup).

For production, you MUST use an external message broker like Redis Pub/Sub,
RabbitMQ, or a dedicated WebSocket service to handle real-time communication
across multiple servers. This code is for demonstration on a single instance ONLY.
================================================================================
*/
const sseConnections = {};

// Controller for Server-Sent Events (SSE) connection
export const sseController = (req, res, next) => {
    try {
        const { userId } = req.auth();
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Store the response object to send events later
        sseConnections[userId] = res;
        console.log(`User ${userId} connected for SSE.`);

        // Send a ping every 25 seconds to keep the connection alive
        const keepAlive = setInterval(() => {
            res.write(`: ping\n\n`);
        }, 25000);

        // When the client closes the connection, remove them from the list
        req.on('close', () => {
            clearInterval(keepAlive);
            delete sseConnections[userId];
            console.log(`User ${userId} disconnected from SSE.`);
            res.end();
        });

    } catch (err) {
        next(err);
    }
};

// Send a new message
export const sendMessage = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const image = req.file;

        let media_url = "";
        const message_type = image ? "image" : "text";

        if (image) {
            const response = await imagekit.upload({
                file: image.buffer,
                fileName: `message_${userId}_${Date.now()}`,
                folder: 'messages'
            });
            media_url = response.url;
        }

        const newMessage = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url,
        });

        // Push the new message to the recipient if they are connected via SSE
        const recipientConnection = sseConnections[to_user_id];
        if (recipientConnection) {
            console.log(`Pushing message via SSE to recipient: ${to_user_id}`);
            recipientConnection.write(`event: newMessage\n`);
            recipientConnection.write(`data: ${JSON.stringify(newMessage)}\n\n`);
        }
        
        res.status(201).json({ success: true, message: newMessage });

    } catch (error) {
        next(error);
    }
};

// Get chat history between two users
export const getChatMessages = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { otherUserId } = req.params; // Get other user's ID from URL parameters

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id: otherUserId },
                { from_user_id: otherUserId, to_user_id: userId },
            ],
        }).sort({ createdAt: 1 }); // Sort oldest to newest for chat history

        // Mark all messages from the other user to the current user as 'seen'
        await Message.updateMany(
            { from_user_id: otherUserId, to_user_id: userId, seen: false },
            { $set: { seen: true } }
        );

        res.json({ success: true, messages });
    } catch (error) {
        next(error);
    }
};

// Get a list of recent conversations
export const getConversations = async (req, res, next) => {
    try {
        const { userId } = req.auth();

        // This is a more advanced query to get a list of unique conversations
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ from_user_id: userId }, { to_user_id: userId }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$from_user_id', userId] },
                            then: '$to_user_id',
                            else: '$from_user_id',
                        },
                    },
                    lastMessage: { $first: '$$ROOT' },
                },
            },
            {
                $replaceRoot: { newRoot: '$lastMessage' },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'from_user_id',
                    foreignField: '_id',
                    as: 'from_user_details',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'to_user_id',
                    foreignField: '_id',
                    as: 'to_user_details',
                },
            },
            {
                $unwind: '$from_user_details',
            },
            {
                $unwind: '$to_user_details',
            },
            {
                $project: {
                    // Customize the final output for the conversation list
                    _id: 1,
                    text: 1,
                    seen: 1,
                    createdAt: 1,
                    from_user: {
                        _id: '$from_user_details._id',
                        full_name: '$from_user_details.full_name',
                        profile_picture: '$from_user_details.profile_picture',
                    },
                     to_user: {
                        _id: '$to_user_details._id',
                        full_name: '$to_user_details.full_name',
                        profile_picture: '$to_user_details.profile_picture',
                    },
                }
            }
        ]);

        res.json({ success: true, conversations });
    } catch (error) {
        next(error);
    }
};