import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        user: { 
            type: String, 
            ref: 'User', 
            required: true 
        },
        content: { 
            type: String 
        },
        image_urls: [{ 
            type: String 
        }],
        post_type: {
            type: String,
            enum: ['text', 'image', 'text_with_image'],
            required: true
        },
        // Renamed from likes_count for clarity
        likes: [{ 
            type: String, 
            ref: 'User' 
        }],
        // Added to store comments
        comments: [{ 
            type: mongoose.Schema.Types.ObjectId, // Assuming you will have a Comment model
            ref: 'Comment' 
        }],
        comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    },
    { 
        timestamps: true,
        // Enable virtuals to be included in JSON output
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// --- VIRTUALS ---
// Create a virtual property `likesCount`
postSchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

// Create a virtual property `commentsCount`
postSchema.virtual('commentsCount').get(function() {
    return this.comments.length;
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;