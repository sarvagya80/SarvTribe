import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useUser } from '@clerk/clerk-react';
// ✅ Import the new thunk
import { fetchConversations } from '../fetures/conversations/conversationsSlice';

const RecentMessages = () => {
    const dispatch = useDispatch();
    const { isSignedIn } = useUser();
    // ✅ Read data directly from the Redux store
    const conversations = useSelector((state) => state.conversations.list);
    const currentUser = useSelector((state) => state.user.data);

    // Fetch initial conversations when the component mounts
    useEffect(() => {
        if (isSignedIn) {
            dispatch(fetchConversations());
        }
    }, [isSignedIn, dispatch]);
    
    // No more polling or local state needed! The SSE connection updates Redux automatically.

    return (
        <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
            <h3 className='font-semibold mb-4'>Recent Messages</h3>
            <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
                {conversations.map((convo) => {
                    // Determine the other user in the conversation
                    const otherUser = convo.from_user._id === currentUser._id 
                        ? convo.to_user 
                        : convo.from_user;

                    return (
                        <Link to={`/messages/${otherUser._id}`} key={convo._id} className='flex items-start gap-2 py-2 hover:bg-slate-100'>
                            <img src={otherUser.profile_picture} className='w-8 h-8 rounded-full object-cover' alt={`${otherUser.full_name}'s profile`} />
                            <div className='w-full'>
                                <div className='flex justify-between'>
                                    <p className='font-semibold text-slate-700'>{otherUser.full_name}</p>
                                    <p className='text-slate-400'>{moment(convo.createdAt).fromNow()}</p>
                                </div>
                                <div className='flex justify-between'>
                                    <p className='text-gray-500 truncate'>{convo.text ? convo.text : 'Media'}</p>
                                    {/* Unread indicator logic */}
                                    {!convo.seen && convo.to_user._id === currentUser._id && (
                                        <p className='bg-indigo-500 text-white w-2 h-2 flex items-center justify-center rounded-full'></p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};

export default RecentMessages;