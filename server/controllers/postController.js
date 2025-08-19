import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js"; // 👈 1. Import the Comment model
import imagekit from "../configs/imagekit.js";

// --- Post Functions ---

export const createPost = async (req, res, next) => {
    try {
        const { userId } = req.auth(); 
        const { content, post_type } = req.body;
        const files = req.files || [];
        let image_urls = [];

        if (files.length > 0) {
            image_urls = await Promise.all(
                files.map(async (file) => {
                    const response = await imagekit.upload({ file: file.buffer, fileName: `post_${userId}_${Date.now()}`, folder: 'posts' });
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
        const currentUser = await User.findById(userId).select('following').lean();
        const feedUserIds = [userId, ...(currentUser?.following || [])];
        const posts = await Post.find({ user: { $in: feedUserIds } })
            .populate('user', 'full_name username profile_picture isVerified')
            .sort({ createdAt: -1 })
            .lean();
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
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const isLiked = post.likes.includes(userId);
        if (isLiked) {
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

// --- Comment Functions ---

// ✅ 2. ADDED: Controller to create a new comment
export const createComment = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "Comment text cannot be empty." });
        }

        const newComment = new Comment({
            post: postId,
            user: userId,
            text,
        });
        await newComment.save();

        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

        await newComment.populate('user', 'full_name profile_picture');
        res.status(201).json({ success: true, comment: newComment });
    } catch (error) {
        next(error);
    }
};

// ✅ 3. ADDED: Controller to fetch all comments for a post
export const getCommentsForPost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate('user', 'full_name profile_picture')
            .sort({ createdAt: 'desc' })
            .lean();
        res.json({ success: true, comments });
    } catch (error) {
        next(error);
    }
};