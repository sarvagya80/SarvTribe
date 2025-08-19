// src/pages/Connections.jsx

import React, { useState } from 'react';
import { Users, UserPlus, UserCheck, Edit, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

import { fetchUserNetwork } from '../fetures/connections/connectionSlice';
import api from '../api/axios';
import Loading from '../components/Loading';

const Connections = () => {
    const [currentTab, setCurrentTab] = useState('Followers');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { connections, pendingRequests, followers, following, status } = useSelector(
        (state) => state.connections
    );
    
    const dataMap = {
        'Followers': followers,
        'Following': following,
        'Pending': pendingRequests,
        'Connections': connections,
    };
    
    const handleUnfollow = async (targetUserId) => {
        try {
            await api.post('/api/user/unfollow', { targetUserId });
            dispatch(fetchUserNetwork()); // Refetch to ensure state is accurate
            toast.success("User unfollowed.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to unfollow.");
        }
    };

    const acceptConnection = async (requesterUser) => {
        try {
            const requesterId = requesterUser._id;
            await api.post('/api/user/connect/accept', { requesterId });
            dispatch(fetchUserNetwork()); // Refetch to update all lists
            toast.success("Connection accepted!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept connection.");
        }
    };

    if (status === 'idle' || status === 'loading') {
        return <Loading />;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900'>Your Network</h1>
                <p className='text-gray-600 '>Manage your connections and discover new people.</p>
            </div>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {Object.keys(dataMap).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setCurrentTab(tab)}
                            className={`${
                                currentTab === tab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab} ({dataMap[tab].length})
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="space-y-4">
                {dataMap[currentTab].length > 0 ? (
                    dataMap[currentTab].map(user => (
                        <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
                                <img src={user.profile_picture} alt={user.full_name} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="font-semibold text-gray-800">{user.full_name}</p>
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {currentTab === 'Following' && (
                                    <button onClick={() => handleUnfollow(user._id)} className="px-4 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-100 font-semibold">
                                        Unfollow
                                    </button>
                                )}
                                {currentTab === 'Pending' && (
                                    <button onClick={() => acceptConnection(user)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-semibold">
                                        Accept
                                    </button>
                                )}
                                {currentTab === 'Connections' && (
                                    <button onClick={() => navigate(`/messages/${user._id}`)} className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 font-semibold flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Message
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No users in this list.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Connections;