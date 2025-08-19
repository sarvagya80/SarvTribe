import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loading from './Loading';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state) => state.user.data);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const { data } = await api.get(`/api/post/${postId}/comments`);
                if (data.success) {
                    setComments(data.comments);
                }
            } catch (error) {
                toast.error("Failed to load comments.");
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [postId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const { data } = await api.post(`/api/post/${postId}/comment`, { text: newComment });
            if (data.success) {
                // Add the new comment to the top of the list instantly
                setComments(prev => [data.comment, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            toast.error("Failed to post comment.");
        }
    };

    if (loading) {
        return <div className="p-4"><Loading height="50px"/></div>;
    }

    return (
        <div className="p-4 pt-2 border-t border-gray-100">
            {/* Comment input form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mb-4">
                <img src={currentUser.profile_picture} alt="Your profile" className="w-8 h-8 rounded-full" />
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-100 border-transparent rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700">
                    Post
                </button>
            </form>

            {/* List of comments */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
                {comments.map(comment => (
                    <div key={comment._id} className="flex items-start gap-2">
                        <img src={comment.user.profile_picture} alt={comment.user.full_name} className="w-8 h-8 rounded-full mt-1" />
                        <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                            <div className="flex items-baseline gap-2">
                                <p className="font-semibold text-sm">{comment.user.full_name}</p>
                                <p className="text-xs text-gray-500">{moment(comment.createdAt).fromNow()}</p>
                            </div>
                            <p className="text-sm text-gray-800">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;