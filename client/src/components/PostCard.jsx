import React, { useState } from 'react';
import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ✅ 1. Import the new CommentSection component
import CommentSection from './CommentSection';

const PostCard = ({ post }) => {
    const currentUser = useSelector((state) => state.user.data);
    const [likes, setLikes] = useState(Array.isArray(post.likes) ? post.likes : []);
    const isLiked = likes.includes(currentUser?._id);
    const navigate = useNavigate();

    // ✅ 2. Add state to show or hide the comment section
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        if (!currentUser) {
            return toast.error("You must be logged in to like a post.");
        }
        const originalLikes = [...likes];
        const alreadyLiked = likes.includes(currentUser._id);
        setLikes(prev => 
            alreadyLiked 
                ? prev.filter(id => id !== currentUser._id) 
                : [...prev, currentUser._id]
        );
        try {
            await api.patch(`/api/post/${post._id}/like`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
            setLikes(originalLikes);
        }
    };
    
    const renderContent = () => {
        if (!post.content) return null;
        const parts = post.content.split(/(#\w+)/g);
        return (
            <p className="text-gray-800 text-sm whitespace-pre-line">
                {parts.map((part, index) => 
                    part.startsWith('#') 
                        ? <span key={index} className="text-indigo-600 font-semibold cursor-pointer">{part}</span> 
                        : part
                )}
            </p>
        );
    };

    if (!post || !post.user) {
        return null;
    }

    return (
        // Use a standard div instead of React.Fragment to ensure a single root for styling
        <div className="bg-white rounded-xl shadow p-4 w-full max-w-2xl">
            <div className="space-y-4">
                {/* User info */}
                <div
                    onClick={() => navigate(`/profile/${post.user._id}`)}
                    role="button" tabIndex="0"
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
                    <div className={`grid gap-2 ${post.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.image_urls.map((img, index) => (
                            <img src={img} key={index} alt={`Post media ${index + 1}`} className="w-full h-auto max-h-96 object-cover rounded-lg" />
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-100">
                    <button onClick={handleLike} aria-label={isLiked ? "Unlike post" : "Like post"} className="flex items-center gap-1.5 p-1">
                        <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'hover:text-red-500'}`} />
                        <span>{likes.length}</span>
                    </button>
                    <button
                        // ✅ 3. Toggle the comment section visibility on click
                        onClick={() => setShowComments(!showComments)}
                        aria-label="View comments"
                        className="flex items-center gap-1.5 hover:text-gray-900 p-1"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments?.length || 0}</span>
                    </button>
                    <button aria-label="Share post" className="flex items-center gap-1.5 hover:text-gray-900 p-1">
                        <Share2 className="w-5 h-5" />
                        <span>{post.shares_count || 0}</span>
                    </button>
                </div>
            </div>

            {/* ✅ 4. Conditionally render the comment section */}
            {showComments && <CommentSection postId={post._id} />}
        </div>
    );
};

export default PostCard;