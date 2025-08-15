import imagekit from "../configs/imagekit.js";
import Story from "../models/Story.js";
import User from '../models/User.js';
import { inngest } from "../inngest/index.js";

// Add User Story
export const addUserStory = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Correctly get userId from the auth object
        const { content, media_type, background_color } = req.body;
        const media = req.file; // From upload.single('media')
        let media_url = "";

        // Upload media to ImageKit if it's an image or video
        if (media && (media_type === "image" || media_type === "video")) {
            const response = await imagekit.upload({
                file: media.buffer, // Use the file buffer from memoryStorage
                fileName: media.originalname,
            });
            media_url = response.url;
        }

        // Create new story
        const story = await Story.create({
            user: userId,
            content,
            media_type,
            background_color,
            media_url,
        });

        // Schedule story deletion after 24 hours
        await inngest.send({
            name: 'app/story.created', // Use the logical event name
            data: { storyId: story._id }
        });

        res.status(201).json({ success: true, message: "Story created successfully." });
    } catch (error) {
        next(error); // Pass errors to the central handler
    }
};

// Get User Stories Feed
export const getStories = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Correctly get userId
        const user = await User.findById(userId);

        if (!user) {
            // You can return an empty array or an error.
            // Returning an empty array is often better for the frontend.
            return res.json({ success: true, stories: [] });
        }

        // Find stories from the user, their connections, and people they follow
        const userIds = [userId, ...user.connections, ...user.following];

        const stories = await Story.find({ user: { $in: userIds } })
            .populate("user", "full_name username profile_picture isVerified") // Select specific fields
            .sort({ createdAt: -1 });

        res.json({ success: true, stories });
    } catch (error) {
        next(error); // Pass errors to the central handler
    }
};