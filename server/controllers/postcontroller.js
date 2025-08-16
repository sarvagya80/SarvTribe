import Post from "../models/Post.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";

// Create a new post
export const createPost = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const { content, post_type } = req.body;
        const images = req.files || [];
        let image_urls = [];

        if (images.length > 0) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const response = await imagekit.upload({
                        file: image.buffer,
                        fileName: `post_${userId}_${Date.now()}`,
                        folder: 'posts',
                    });
                    return response.url;
                })
            );
        }

        const newPost = await Post.create({
            user: userId,
            content,
            image_urls,
            post_type,
        });

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: newPost
        });
    } catch (error) {
        next(error);
    }
};

// Get posts for the user's feed
export const getFeedPosts = async (req, res, next) => {
    try {
        const { userId } = req.auth;

        // Find the current user to get their 'following' list
        const currentUser = await User.findById(userId).select('following');
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Create a list of users whose posts should be in the feed (self + followed users)
        const feedUserIds = [userId, ...currentUser.following];

        const posts = await Post.find({ user: { $in: feedUserIds } })
            .populate('user', 'full_name username profile_picture')
            .sort({ createdAt: -1 });

        res.json({ success: true, posts });
    } catch (err) {
        next(err);
    }
};

// Like or unlike a post
export const likeUnlikePost = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const { postId } = req.params; // Get postId from URL parameters for RESTful design

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unlike
            await post.updateOne({ $pull: { likes: userId } });
            res.json({ success: true, message: "Post unliked" });
        } else {
            // Like
            await post.updateOne({ $addToSet: { likes: userId } });
            res.json({ success: true, message: "Post liked" });
        }
    } catch (error) {
        next(error);
    }
};