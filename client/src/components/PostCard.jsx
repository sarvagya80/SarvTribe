import React, { useState } from 'react';
import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
    // ✅ CORRECTED: The user data is in state.user.data
    const currentUser = useSelector((state) => state.user.data);
    const [likes, setLikes] = useState(Array.isArray(post.likes) ? post.likes : []);
    const isLiked = likes.includes(currentUser?._id);
    const navigate = useNavigate();

    const handleLike = async () => {
        const originalLikes = [...likes];
        const alreadyLiked = likes.includes(currentUser._id);

        // Optimistic UI update
        setLikes(prev => 
            alreadyLiked 
                ? prev.filter(id => id !== currentUser._id) 
                : [...prev, currentUser._id]
        );

        try {
            // ✅ CHANGED: Updated to the correct RESTful endpoint and method.
            // No need to pass a body or token headers anymore.
            await api.patch(`/api/post/${post._id}/like`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
            setLikes(originalLikes); // Revert on error
        }
    };
    
    const renderContent = () => {
        // This hashtag rendering is great! No changes needed.
        if (!post.content) return null;
        const parts = post.content.split(/(#\w+)/g);
        return (
            <p className="text-gray-800 text-sm whitespace-pre-line">
                {parts.map((part, index) => 
                    part.startsWith('#') 
                        ? <span key={index} className="text-indigo-600 font-semibold">{part}</span> 
                        : part
                )}
            </p>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
            {/* User info - Accessibility is great here */}
            <div
                onClick={() => navigate(`/profile/${post.user._id}`)}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/profile/${post.user._id}`)}
                className="inline-flex items-center gap-3 cursor-pointer"
            >
                <img
                    src={post.user.profile_picture || 'default-avatar.png'}
                    alt={`${post.user.full_name}'s profile`}
                    className="w-10 h-10 rounded-full shadow object-cover"
                />
                <div>
                    <div className="flex items-center space-x-1">
                        <span className="font-semibold">{post.user.full_name}</span>
                        {post.user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="text-gray-500 text-sm">
                        @{post.user.username} • {moment(post.createdAt).fromNow()}
                    </div>
                </div>
            </div>

            {/* Content & Images */}
            {post.content && renderContent()}
            {post.image_urls && post.image_urls.length > 0 && (
                 <div className="grid grid-cols-2 gap-2">
                    {post.image_urls.map((img, index) => (
                        <img
                            src={img}
                            key={index}
                            alt={`Post media ${index + 1}`}
                            className={`w-full h-48 object-cover rounded-lg ${
                                post.image_urls.length === 1 && 'col-span-2 h-auto'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-200">
                <button
                    onClick={handleLike}
                    aria-label={isLiked ? "Unlike post" : "Like post"}
                    className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
                >
                    <Heart
                        className={`w-4 h-4 transition-colors ${
                            isLiked ? 'text-red-500 fill-red-500' : 'hover:text-red-500'
                        }`}
                    />
                    <span>{likes.length}</span>
                </button>
                <button
                    onClick={() => navigate(`/post/${post._id}`)}
                    aria-label="View comments"
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md"
                >
                    <MessageCircle className="w-4 h-4" />
                    {/* ✅ CORRECTED: Use the virtual 'commentsCount' from the schema */}
                    <span>{post.commentsCount || 0}</span>
                </button>
                 <button
                    aria-label="Share post"
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md"
                >
                    <Share2 className="w-4 h-4" />
                    {/* Note: 'shares_count' is not in the schema, you may want to add it */}
                    <span>{post.shares_count || 0}</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;