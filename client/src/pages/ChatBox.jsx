// src/pages/ChatBox.jsx

import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, SendHorizonal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../api/axios';
import { addMessage, resetMessages, fetchMessages } from '../fetures/messages/messagesSlice';
import Loading from '../components/Loading';

const ChatBox = () => {
    const { messages, status } = useSelector((state) => state.messages);
    const { connections } = useSelector((state) => state.connections);
    const currentUser = useSelector((state) => state.user.data);

    const { userId } = useParams(); // This is the ID of the other user
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [recipient, setRecipient] = useState(null);
    const messagesEndRef = useRef(null);

    // This useEffect is crucial to prevent memory leaks from image previews
    useEffect(() => {
        return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
    }, [imagePreview]);

    const handleImageChange = (e) => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const sendMessage = async () => {
        if (!text.trim() && !image) return;

        const formData = new FormData();
        formData.append('to_user_id', userId);
        formData.append('text', text);
        if (image) formData.append('image', image);
        
        // Clear inputs immediately for a better user experience
        setText('');
        setImage(null);
        setImagePreview(null);
        
        try {
            const { data } = await api.post('/api/message/send', formData);
            if (data.success) {
                dispatch(addMessage(data.message));
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message.");
        }
    };

    // Effect to fetch initial chat history when the page loads
    useEffect(() => {
        if (userId) {
            dispatch(fetchMessages(userId));
        }
        // Cleanup function to clear messages when navigating away
        return () => {
            dispatch(resetMessages());
        };
    }, [userId, dispatch]);

    // Effect to find the recipient's info from the connections list
    useEffect(() => {
        if (connections.length > 0) {
            const targetUser = connections.find(connection => connection._id === userId);
            setRecipient(targetUser);
        }
    }, [connections, userId]);

    // Effect to scroll to the bottom of the messages when a new one arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (status === 'loading') {
        return <div className="flex-1 flex items-center justify-center"><Loading height="auto" /></div>;
    }

    if (!recipient) {
        return <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation to start chatting.</div>;
    }

    return (
        <div className='flex flex-col h-full bg-gray-50'>
            {/* Header */}
            <div className='flex items-center gap-4 p-4 border-b border-gray-200 bg-white cursor-pointer' onClick={() => navigate(`/profile/${recipient._id}`)}>
                <img src={recipient.profile_picture} className='size-10 rounded-full object-cover' alt={`${recipient.full_name}'s profile`} />
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
                                    {message.message_type === 'image' && <img src={message.media_url} alt="Sent Media" className='w-full max-w-xs rounded-lg mb-2' />}
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            {/* Input Area */}
            <div className='p-4 bg-white border-t'>
                <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-4xl mx-auto border-gray-300 border shadow-sm rounded-full'>
                    <input
                        type='text'
                        className='flex-1 outline-none bg-transparent text-slate-700'
                        placeholder='Type a message...'
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                    />
                    <label htmlFor='image-upload' className="cursor-pointer p-2 rounded-full hover:bg-gray-100">
                        {imagePreview ? (
                            <img src={imagePreview} className='h-6 w-6 object-cover rounded' alt="Image preview" />
                        ) : (
                            <ImageIcon className='size-6 text-gray-400' />
                        )}
                        <input type='file' id='image-upload' accept='image/*' hidden onChange={handleImageChange} />
                    </label>
                    <button onClick={sendMessage} className='bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2.5 rounded-full hover:from-indigo-600 hover:to-purple-700 transition active:scale-95'>
                        <SendHorizonal size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;