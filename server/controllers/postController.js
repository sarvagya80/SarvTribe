import Post from "../models/Post.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";

export const createPost = async (req, res, next) => {
    try {
        // ✅ FINAL: Using req.auth() as a function for the latest Clerk version
        const { userId } = req.auth(); 
        const { content, post_type } = req.body;
        const files = req.files || [];
        let image_urls = [];

        if (files.length > 0) {
            image_urls = await Promise.all(
                files.map(async (file) => {
                    const response = await imagekit.upload({
                        file: file.buffer,
                        fileName: `post_${userId}_${Date.now()}`,
                        folder: 'posts',
                    });
                    return response.url;
                })
            );
        }
        const newPost = await Post.create({ user: userId, content, image_urls, post_type });
        await newPost.populate('user', 'full_name username profile_picture isVerified');
        res.status(201).json({ success: true, message: "Post created", post: newPost });
    } catch (error) {
        next(error);
    }
};

export const getFeedPosts = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const currentUser = await User.findById(userId).select('following');
        const feedUserIds = [userId, ...(currentUser?.following || [])];
        const posts = await Post.find({ user: { $in: feedUserIds } })
            .populate('user', 'full_name username profile_picture isVerified')
            .sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (err) {
        next(err);
    }
};

export const likeUnlikePost = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        if (post.likes.includes(userId)) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.json({ success: true, message: "Post unliked" });
        } else {
            await Post.updateOne({ _id: postId }, { $addToSet: { likes: userId } });
            res.json({ success: true, message: "Post liked" });
        }
    } catch (error) {
        next(error);
    }
};