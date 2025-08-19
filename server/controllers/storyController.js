import Story from '../models/Story.js';
import User from '../models/User.js';
import imagekit from '../configs/imagekit.js';
import { inngest } from '../inngest/index.js';

export const getAllStories = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const currentUser = await User.findById(userId).select('connections following');
        if (!currentUser) {
            return res.json({ success: true, stories: [] });
        }
        
        const storyAuthors = [userId, ...currentUser.connections, ...currentUser.following];
        const uniqueAuthors = [...new Set(storyAuthors.map(id => id.toString()))];

        const stories = await Story.find({ user: { $in: uniqueAuthors } })
            .populate('user', 'full_name username profile_picture isVerified')
            .sort({ createdAt: -1 });
        
        // Group stories by user for a clean output
        const storiesByUser = stories.reduce((acc, story) => {
            const authorId = story.user._id.toString();
            if (!acc[authorId]) {
                acc[authorId] = { user: story.user, stories: [] };
            }
            acc[authorId].stories.push(story);
            return acc;
        }, {});

        res.json({ success: true, stories: Object.values(storiesByUser) });
    } catch (err) {
        next(err);
    }
};

export const createStory = async (req, res, next) => {
    // ... (Your createStory function is perfect as is) ...
};