import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        from_user_id: { type: String, ref: 'User', required: true },
        to_user_id: { type: String, ref: 'User', required: true },
        text: { type: String, trim: true },
        message_type: { 
            type: String, 
            enum: ['text', 'image'],
            required: true
        },
        media_url: { type: String },
        seen: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// --- PERFORMANCE: Add indexes for fast conversation lookups ---
messageSchema.index({ from_user_id: 1, to_user_id: 1 });
messageSchema.index({ createdAt: -1 });


// --- DATA INTEGRITY: Ensure messages are not empty before saving ---
messageSchema.pre('save', function(next) {
    if (this.message_type === 'text' && !this.text?.trim()) {
        return next(new Error('Text content cannot be empty for a text message.'));
    }
    if (this.message_type === 'image' && !this.media_url) {
        return next(new Error('Media URL is required for an image message.'));
    }
    next();
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;