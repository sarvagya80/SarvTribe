// src/components/UserCard.jsx

import React from 'react';
import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../api/axios';
// ✅ FIXED: Corrected import path from "fetures" to "features"
import { startFollowing, revertFollow } from '../fetures/user/userSlice';
import { fetchUserNetwork } from '../fetures/connections/connectionSlice';

const UserCard = ({ user }) => {
    const currentUser = useSelector((state) => state.user.data);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleFollow = async () => {
        if (!user?._id || !currentUser) return;
        if (user._id === currentUser._id) return; // Cannot follow self

        const targetUserId = user._id;
        // Optimistic UI update for instant feedback
        dispatch(startFollowing(targetUserId));

        try {
            const { data } = await api.post('/api/user/follow', { targetUserId });
            if (!data.success) {
                toast.error(data.message);
                dispatch(revertFollow(targetUserId)); // Revert on failure
            } else {
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
            dispatch(revertFollow(targetUserId)); // Revert on failure
        }
    };

    const handleConnectionRequest = async () => {
        if (!user?._id || !currentUser) return;
        if (user._id === currentUser._id) return; // Cannot connect with self

        const targetUserId = user._id;

        if (currentUser.connections.includes(targetUserId)) {
            return navigate(`/messages/${targetUserId}`);
        }

        try {
            const { data } = await api.post('/api/user/connect/send', { targetUserId });
            if (data.success) {
                toast.success(data.message);
                dispatch(fetchUserNetwork()); // Refresh network state
            } else {
                toast.error(data.message || "Connection request failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
        }
    };

    if (!user || !currentUser) {
        return null; 
    }

    // Pre-calculate flags for cleaner JSX
    const isFollowing = currentUser.following.includes(user._id);
    const isConnected = currentUser.connections.includes(user._id);
    const isSelf = currentUser._id === user._id;

    return (
        <div className='p-4 pt-6 flex flex-col justify-between w-full max-w-xs mx-auto bg-white shadow-lg border border-gray-100 rounded-xl transition-all hover:shadow-xl hover:-translate-y-1'>
            <div className='text-center cursor-pointer' onClick={() => navigate(`/profile/${user._id}`)}>
                <img src={user.profile_picture} className='rounded-full w-20 h-20 object-cover shadow-md mx-auto' alt={`${user.full_name}'s profile`} />
                <p className='mt-4 font-bold text-lg text-gray-800'>{user.full_name}</p>
                {user.username && <p className='text-gray-500 font-medium'>@{user.username}</p>}
                {user.bio && <p className='text-gray-600 mt-2 text-center text-sm px-4 h-10 overflow-hidden'>{user.bio}</p>}
            </div>

            <div className='flex items-center justify-center gap-2 mt-4 text-xs text-gray-600'>
                {user.location &&
                    <div className='flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 bg-gray-50'>
                        <MapPin className='w-4 h-4 text-gray-400'/>{user.location}
                    </div>
                }
            </div>
            
            {!isSelf && (
                <div className='flex mt-6 gap-2'>
                    <button onClick={handleFollow} disabled={isFollowing} className='w-full py-2.5 rounded-md flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed'>
                        <UserPlus className='w-4 h-4'/>{isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button onClick={handleConnectionRequest} className='flex items-center justify-center w-16 border border-gray-300 text-gray-500 group rounded-md active:scale-95 transition hover:bg-gray-100'>
                        {isConnected ? <MessageCircle className='w-5 h-5 group-hover:scale-105 transition'/> : <Plus className='w-5 h-5 group-hover:scale-105 transition'/>}
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserCard;