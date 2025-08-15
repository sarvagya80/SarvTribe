import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Emails should also be unique
        index: true,  // Add an index for faster lookups
    },
    full_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple users to have a null/missing username
    },
    bio: {
        type: String,
        default: 'Hey there! I am using SarvTribe.'
    },
    profile_picture: {
        type: String,
        // Provide a default avatar URL
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    },
    cover_photo: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    timezone: {
        type: String,
        default: 'America/New_York'
    },
    followers: [{ type: String, ref: 'User' }],
    following: [{ type: String, ref: 'User' }],
    connections: [{ type: String, ref: 'User' }],

}, { timestamps: true }); // minimize:false is generally not needed for this schema

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;