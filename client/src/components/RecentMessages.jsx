// src/components/RecentMessages.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useSelector } from 'react-redux';

const RecentMessages = () => {
    // Data is read directly from the Redux store, which is updated in real-time.
    const conversations = useSelector((state) => state.conversations.list);
    const currentUser = useSelector((state) => state.user.data);

    // Don't render the component until the logged-in user's data is available.
    if (!currentUser) {
        return (
            <div className='bg-white p-4 rounded-lg shadow'>
                <h3 className='font-semibold mb-4 text-gray-800'>Recent Messages</h3>
                <div className="space-y-3 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className='bg-white p-4 rounded-lg shadow'>
            <h3 className='font-semibold mb-4 text-gray-800'>Recent Messages</h3>
            <div className='flex flex-col max-h-80 overflow-y-auto space-y-1'>
                {conversations.length > 0 ? (
                    conversations.map((convo) => {
                        // Determine the other user in the conversation.
                        const otherUser = convo.from_user._id === currentUser._id 
                            ? convo.to_user 
                            : convo.from_user;

                        return (
                            <Link to={`/messages/${otherUser._id}`} key={convo._id} className='flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50'>
                                <img src={otherUser.profile_picture} className='w-10 h-10 rounded-full object-cover' alt={`${otherUser.full_name}'s profile`} />
                                <div className='w-full overflow-hidden'>
                                    <div className='flex justify-between items-center'>
                                        <p className='font-semibold text-sm text-gray-800 truncate'>{otherUser.full_name}</p>
                                        <p className='text-xs text-gray-400 flex-shrink-0'>{moment(convo.createdAt).fromNow(true)}</p>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <p className='text-sm text-gray-500 truncate'>{convo.text ? convo.text : 'Media'}</p>
                                        {/* Show an indicator for unread messages. */}
                                        {!convo.seen && convo.to_user._id === currentUser._id && (
                                            <span className='bg-indigo-500 w-2.5 h-2.5 rounded-full flex-shrink-0'></span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No recent conversations.</p>
                )}
            </div>
        </div>
    );
};

export default RecentMessages;