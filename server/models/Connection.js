import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
    {
        from_user_id: { type: String, ref: 'User', required: true, index: true },
        to_user_id: { type: String, ref: 'User', required: true, index: true },
        status: {
            type: String,
            enum: ['pending', 'accepted'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

// --- DATA INTEGRITY: Prevent duplicate connection requests ---
// This ensures that the pair of (from_user_id, to_user_id) is unique.
connectionSchema.index({ from_user_id: 1, to_user_id: 1 }, { unique: true });

const Connection = mongoose.models.Connection || mongoose.model('Connection', connectionSchema);

export default Connection;