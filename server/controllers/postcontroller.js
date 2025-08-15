import Post from "../models/Post.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";

// Add Post
export const addPost = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Correctly get userId
        const { content, post_type } = req.body;
        const images = req.files || [];
        let image_urls = [];

        if (images.length > 0) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const response = await imagekit.upload({
                        file: image.buffer, // Use buffer from memoryStorage
                        fileName: image.originalname,
                        folder: 'posts',
                    });
                    return response.url;
                })
            );
        }

        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type,
        });

        res.status(201).json({
            success: true,
            message: "Post created successfully",
        });
    } catch (error) {
        next(error); // Pass error to central handler
    }
};

// Get Posts for the Feed
export const getFeedPosts = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);

        // --- ADD THIS CHECK ---
        if (!user) {
            // If user isn't found yet, return an empty feed.
            return res.json({ success: true, posts: [] });
        }
        // --- END OF CHECK ---

        const userIds = [userId, ...user.connections, ...user.following];
        const posts = await Post.find({ user: { $in: userIds } })
            .populate("user", "full_name username profile_picture isVerified")
            .sort({ createdAt: -1 });

        res.json({ success: true, posts });
    } catch (error) {
        next(error);
    }
};

// Like / Unlike Post
export const likePost = async (req, res, next) => {
    try {
        const { userId } = req.auth(); // Correctly get userId
        const { postId } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Use the correct field name 'likes' from the schema
        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unlike the post
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            await post.save();
            res.json({ success: true, message: "Post unliked" });
        } else {
            // Like the post
            post.likes.push(userId);
            await post.save();
            // --- CRITICAL FIX: Added the missing response ---
            res.json({ success: true, message: "Post liked" });
        }
    } catch (error) {
        next(error); // Pass error to central handler
    }
};