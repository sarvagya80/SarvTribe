import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react';
import React, { useState } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const [likes, setLikes] = useState(Array.isArray(post.likes) ? post.likes : []);
    const isLiked = likes.includes(currentUser?._id);
    const navigate = useNavigate();

    const handleLike = async () => {
        // --- Start of Optimistic Update ---
        // Store the original state in case we need to revert
        const originalLikes = [...likes];
        const alreadyLiked = likes.includes(currentUser._id);

        // Immediately update the UI
        setLikes(prev => {
            if (alreadyLiked) {
                return prev.filter(id => id !== currentUser._id);
            } else {
                return [...prev, currentUser._id];
            }
        });
        // --- End of Optimistic Update ---

        try {
            const { data } = await api.post(
                "/api/post/like",
                { postId: post._id },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            );

            if (!data.success) {
                // If API reports failure, revert the state and show an error
                toast.error(data.message || "Failed to update like");
                setLikes(originalLikes); 
            }
            // On success, no need to do anything, the UI is already updated.
            // We can optionally show a success toast if desired.
            // toast.success(alreadyLiked ? "Post unliked" : "Post liked");

        } catch (error) {
            // If the request fails entirely, revert the state
            toast.error(error.response?.data?.message || "Something went wrong");
            setLikes(originalLikes);
        }
    };
    
    const renderContent = () => {
        if (!post.content) return null;
        const parts = post.content.split(/(#\w+)/g);
        return (
            <p className="text-gray-800 text-sm whitespace-pre-line">
                {parts.map((part, index) => {
                    if (part.startsWith('#')) {
                        return <span key={index} className="text-indigo-600 font-semibold">{part}</span>;
                    }
                    return part;
                })}
            </p>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
            {/* User info */}
            <div
                onClick={() => navigate('/profile/' + post.user._id)}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/profile/' + post.user._id)}
                className="inline-flex items-center gap-3 cursor-pointer"
            >
                <img
                    src={post.user.profile_picture || 'default-avatar.png'}
                    alt={`${post.user.full_name}'s profile`}
                    className="w-10 h-10 rounded-full shadow"
                />
                <div>
                    <div className="flex items-center space-x-1">
                        <span>{post.user.full_name}</span>
                        {post.user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="text-gray-500 text-sm">
                        @{post.user.username} • {moment(post.createdAt).fromNow()}
                    </div>
                </div>
            </div>

            {/* Content & Images */}
            {post.content && renderContent()}
            <div className="grid grid-cols-2 gap-2">
                {post.image_urls.map((img, index) => (
                    img && (
                        <img
                            src={img}
                            key={index}
                            alt={`Post media ${index + 1}`}
                            className={`w-full h-48 object-cover rounded-lg ${
                                post.image_urls.length === 1 && 'col-span-2 h-auto'
                            }`}
                        />
                    )
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
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
                    <span>{post.comments_count || 0}</span>
                </button>
                <button
                    aria-label="Share post"
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md"
                >
                    <Share2 className="w-4 h-4" />
                    <span>{post.shares_count || 0}</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;