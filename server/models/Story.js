import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
    {
        user: { 
            type: String, 
            ref: 'User', 
            required: true 
        },
        content: { 
            type: String 
        },
        // Changed to a single String to match current app functionality
        media_url: { 
            type: String 
        },
        media_type: { 
            type: String, 
            enum: ['text', 'image', 'video'],
            required: true // Media type should always be defined
        },
        // Renamed for clarity and corrected ref
        viewers: [{ 
            type: String, 
            ref: 'User' 
        }],
        // Corrected typo
        background_color: { 
            type: String 
        },
    },
    { timestamps: true } // minimize: false is not needed here
);

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

export default Story;