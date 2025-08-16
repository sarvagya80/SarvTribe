import imagekit from '../configs/imagekit.js';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { inngest } from '../inngest/index.js';

// Create a new story
export const createStory = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.file;
        let media_url = '';

        if (media && (media_type === 'image' || media_type === 'video')) {
            const uploaded = await imagekit.upload({
                file: media.buffer,
                fileName: `story_${userId}_${Date.now()}`,
                folder: 'stories',
            });
            media_url = uploaded.url;
        }

        const story = await Story.create({
            user: userId,
            content: content || '',
            media_type: media_type || 'text',
            background_color: background_color || '#4f46e5',
            media_url,
        });

        // Trigger Inngest function to delete story after 24 hours
        await inngest.send({ name: 'app/story.created', data: { storyId: story._id.toString() } });

        res.status(201).json({ success: true, message: 'Story created successfully.', story });
    } catch (err) {
        next(err);
    }
};

// Get stories for the user's feed
export const getStories = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const currentUser = await User.findById(userId).select('connections following');

        if (!currentUser) {
            return res.json({ success: true, stories: [] });
        }

        // User sees their own stories and stories from people they follow or are connected with
        const storyAuthors = [userId, ...currentUser.connections, ...currentUser.following];
        const uniqueAuthors = [...new Set(storyAuthors.map(id => id.toString()))];

        const stories = await Story.find({ user: { $in: uniqueAuthors } })
            .populate('user', 'full_name username profile_picture')
            .sort({ createdAt: -1 });
        
        // Optional: Group stories by user
        const storiesByUser = stories.reduce((acc, story) => {
            const authorId = story.user._id.toString();
            if (!acc[authorId]) {
                acc[authorId] = {
                    user: story.user,
                    stories: []
                };
            }
            acc[authorId].stories.push(story);
            return acc;
        }, {});


        res.json({ success: true, stories: Object.values(storiesByUser) });
    } catch (err) {
        next(err);
    }
};