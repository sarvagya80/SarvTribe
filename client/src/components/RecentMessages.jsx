import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useUser, useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RecentMessages = () => {
    const [messages, setMessages] = useState([]);
    const { user } = useUser();
    const { getToken } = useAuth();

    const fetchRecentMessages = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/user/recent-messages', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                // This logic for grouping and sorting is excellent.
                const groupedMessages = data.messages.reduce((acc, message) => {
                    const senderId = message.from_user_id._id;
                    if (!acc[senderId] || new Date(message.createdAt) > new Date(acc[senderId].createdAt)) {
                        acc[senderId] = message;
                    }
                    return acc;
                }, {});

                const sortedMessages = Object.values(groupedMessages).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setMessages(sortedMessages);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            // Use optional chaining for safer error messages
            toast.error(error.response?.data?.message || 'Could not fetch messages.');
        }
    };

    useEffect(() => {
        if (user) {
            fetchRecentMessages();

            // --- CRITICAL FIX ---
            // 1. Store the interval ID
            const intervalId = setInterval(fetchRecentMessages, 30000);

            // 2. Use the ID in the cleanup function
            return () => {
                clearInterval(intervalId);
            };
        }
    }, [user]);

    return (
        <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
            <h3 className='font-semibold mb-4'>Recent Messages</h3>
            <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
                {messages.map((message) => (
                    // Use a stable, unique key instead of index
                    <Link to={`/messages/${message.from_user_id._id}`} key={message._id} className='flex items-start gap-2 py-2 hover:bg-slate-100'>
                        {/* Use optional chaining for safety */}
                        <img src={message.from_user_id?.profile_picture} className='w-8 h-8 rounded-full' alt={`${message.from_user_id?.full_name}'s profile`} />
                        <div className='w-full'>
                            <div className='flex justify-between'>
                                <p className='font-semibold text-slate-700'>{message.from_user_id?.full_name}</p>
                                <p className='text-slate-400'>{moment(message.createdAt).fromNow()}</p>
                            </div>
                            <div className='flex justify-between'>
                                <p className='text-gray-500 truncate'>{message.text ? message.text : 'Media'}</p>
                                {!message.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentMessages;