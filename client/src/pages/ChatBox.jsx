import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, SendHorizonal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

import api from '../api/axios';
import { addMessage, resetMessages, fetchMessages } from '../fetures/messages/messagesSlice'; // Corrected path
import Loading from '../components/Loading'; // Assuming you have a Loading component

const ChatBox = () => {
    // Get the entire messages slice state to access status
    const { messages, status } = useSelector((state) => state.messages);
    const { connections } = useSelector((state) => state.connections);
    const currentUser = useSelector((state) => state.user.value); // Get current user for message alignment

    const { userId } = useParams();
    const { getToken } = useAuth();
    const dispatch = useDispatch();

    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [recipient, setRecipient] = useState(null);
    const messagesEndRef = useRef(null);

    // Effect to clean up the image preview URL
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (e) => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const sendMessage = async () => {
        try {
            if (!text.trim() && !image) return;

            const token = await getToken();
            const formData = new FormData();
            formData.append('to_user_id', userId);
            formData.append('text', text);
            if (image) {
                formData.append('image', image);
            }
            
            // Clear input fields immediately for a faster feel
            setText('');
            setImage(null);
            setImagePreview(null);
            
            const { data } = await api.post('/api/message/send', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                dispatch(addMessage(data.message));
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Effect to fetch initial data
    useEffect(() => {
        if (userId) {
            dispatch(fetchMessages({ token: getToken(), userId }));
        }
        // Cleanup function to clear messages when leaving the chat
        return () => {
            dispatch(resetMessages());
        };
    }, [userId, dispatch, getToken]);

    // Effect to find the recipient's info from connections
    useEffect(() => {
        if (connections.length > 0) {
            const targetUser = connections.find(connection => connection._id === userId);
            setRecipient(targetUser);
        }
    }, [connections, userId]);

    // Effect to scroll to the bottom of the messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (status === 'loading') {
        return <div className="flex-1"><Loading /></div>;
    }

    if (!recipient) {
        // This can show while connections are loading or if user is not a connection
        return <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation to start chatting.</div>;
    }

    return (
        <div className='flex flex-col h-full'>
            {/* Header */}
            <div className='flex items-center gap-4 p-4 border-b border-gray-200 bg-white'>
                <img src={recipient.profile_picture} className='size-10 rounded-full' alt={`${recipient.full_name}'s profile`} />
                <div>
                    <p className='font-semibold'>{recipient.full_name}</p>
                    <p className='text-sm text-gray-500'>@{recipient.username}</p>
                </div>
            </div>
            {/* Message Area */}
            <div className='p-5 flex-1 overflow-y-auto'>
                <div className='space-y-4 max-w-4xl mx-auto'>
                    {messages.map((message) => {
                        const isSentByMe = message.from_user_id === currentUser?._id;
                        return (
                            <div key={message._id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 max-w-lg rounded-xl shadow ${isSentByMe ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none'}`}>
                                    {message.message_type === 'image' && <img src={message.media_url} alt="Sent Media" className='w-full max-w-sm rounded-lg mb-2' />}
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            {/* Input Area */}
            <div className='p-4 bg-gray-50 border-t'>
                <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-4xl mx-auto border-gray-300 border shadow-sm rounded-full'>
                    <input
                        type='text'
                        className='flex-1 outline-none bg-transparent text-slate-700'
                        placeholder='Type a message...'
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                    />
                    <label htmlFor='image-upload' className="cursor-pointer">
                        {imagePreview ? (
                            <img src={imagePreview} className='h-8 w-8 object-cover rounded' alt="Image preview" />
                        ) : (
                            <ImageIcon className='size-7 text-gray-400' />
                        )}
                        <input type='file' id='image-upload' accept='image/*' hidden onChange={handleImageChange} />
                    </label>
                    <button onClick={sendMessage} className='bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2.5 rounded-full'>
                        <SendHorizonal size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;