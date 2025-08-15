import React from 'react';
import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

import api from '../api/axios';
// Import the new actions and other thunks
import { startFollowing, revertFollow } from '../fetures/user/userSlice';
import { fetchConnections } from '../fetures/connections/connectionSlice';

const UserCard = ({ user }) => {
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleFollow = async () => {
        if (!user?._id) return toast.error("User ID missing");

        const targetUserId = user._id;
        
        // 1. Optimistically update the UI
        dispatch(startFollowing(targetUserId));

        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/follow', { id: targetUserId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                // 2a. If API fails, revert the change
                toast.error(data.message);
                dispatch(revertFollow(targetUserId));
            } else {
                toast.success(data.message);
                // On success, the UI is already correct. No extra fetch needed.
            }
        } catch (error) {
            // 2b. If request fails, also revert the change
            toast.error(error.message);
            dispatch(revertFollow(targetUserId));
        }
    };

    const handleConnectionRequest = async () => {
        if (!user?._id) return toast.error("User ID missing");
        
        if (currentUser.connections.includes(user._id)) {
            return navigate(`/messages/${user._id}`);
        }

        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/connect', { id: user._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                // Refresh the connections list to show the new "pending" state
                dispatch(fetchConnections(token));
            } else {
                toast.error(data.message || "Connection request failed");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Return null or a skeleton loader if essential data is missing
    if (!user || !currentUser) {
        return null; 
    }

    const isFollowing = currentUser.following.includes(user._id);
    const isConnected = currentUser.connections.includes(user._id);

    return (
        <div key={user._id} className='p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md'>
            <div className='text-center cursor-pointer' onClick={() => navigate(`/profile/${user._id}`)}>
                <img src={user.profile_picture} className='rounded-full w-16 h-16 object-cover shadow-md mx-auto' alt={`${user.full_name}'s profile`} />
                <p className='mt-4 font-semibold'>{user.full_name}</p>
                {user.username && <p className='text-gray-500 font-light'>@{user.username}</p>}
                {user.bio && <p className='text-gray-600 mt-2 text-center text-sm px-4'>{user.bio}</p>}
            </div>

            <div className='flex items-center justify-center gap-2 mt-4 text-xs text-gray-600'>
                {user.location &&
                    <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                        <MapPin className='w-4 h-4'/>{user.location}
                    </div>
                }
                <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                    <span>{user.followers.length}</span> Followers
                </div>
            </div>
            
            <div className='flex mt-4 gap-2'>
                <button onClick={handleFollow} disabled={isFollowing} className='w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white disabled:opacity-70 disabled:cursor-not-allowed'>
                    <UserPlus className='w-4 h-4'/>{isFollowing ? 'Following' : 'Follow'}
                </button>
                <button onClick={handleConnectionRequest} className='flex items-center justify-center w-16 border text-slate-500 group rounded-md active:scale-95 transition'>
                    {isConnected ? <MessageCircle className='w-5 h-5 group-hover:scale-105 transition'/> : <Plus className='w-5 h-5 group-hover:scale-105 transition'/>}
                </button>
            </div>
        </div>
    )
}

export default UserCard;