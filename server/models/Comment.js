import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true,
    },
    user: {
        type: String, // Clerk User ID
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: [true, 'Comment text cannot be empty.'],
        trim: true,
    },
}, { timestamps: true });

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export default Comment;