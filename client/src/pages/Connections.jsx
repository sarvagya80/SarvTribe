import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

import { fetchConnections, optimisticallyUnfollow, optimisticallyAcceptConnection } from '../fetures/connections/connectionSlice'; // Corrected path
import api from '../api/axios';
import Loading from '../components/Loading'; // Import your Loading component

const Connections = () => {
    const [currentTab, setCurrentTab] = useState('Followers');
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const dispatch = useDispatch();

    const { connections, pendingConnections, followers, following, status } = useSelector(
        (state) => state.connections
    );

    const dataArray = [
        { label: 'Followers', value: followers, icon: Users },
        { label: 'Following', value: following, icon: UserCheck },
        { label: 'Pending', value: pendingConnections, icon: UserRoundPen },
        { label: 'Connections', value: connections, icon: UserPlus },
    ];

    const handleUnfollow = async (userId) => {
        // 1. Optimistically update the UI
        dispatch(optimisticallyUnfollow(userId));
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/unfollow', { id: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
            } else {
                // 2a. If API fails, re-fetch to revert and get correct state
                toast.error(data.message);
                dispatch(fetchConnections(token));
            }
        } catch (error) {
            // 2b. If request fails, also re-fetch
            toast.error(error.message);
            dispatch(fetchConnections(await getToken()));
        }
    };

    const acceptConnection = async (userToAccept) => {
        // 1. Optimistically update the UI
        dispatch(optimisticallyAcceptConnection(userToAccept));
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/accept', { id: userToAccept._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
                dispatch(fetchConnections(token)); // Revert on failure
            }
        } catch (error) {
            toast.error(error.message);
            dispatch(fetchConnections(await getToken())); // Revert on failure
        }
    };

    useEffect(() => {
        // Only fetch if the data hasn't been fetched yet
        if (status === 'idle') {
            const fetchUserConnections = async () => {
                const token = await getToken();
                dispatch(fetchConnections(token));
            };
            fetchUserConnections();
        }
    }, [status, dispatch, getToken]);

    const currentDisplayData = dataArray.find((item) => item.label === currentTab)?.value || [];

    return (
        <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900'>Connections</h1>
                    <p className='text-gray-600'>Manage your professional network.</p>
                </div>

                {/* Summary Cards */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                    {dataArray.map((item) => (
                        <div key={item.label} className='p-4 bg-white shadow rounded-lg text-center'>
                            <p className='text-2xl font-bold text-gray-900'>{item.value.length}</p>
                            <p className='text-sm text-gray-500'>{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tab Navigation */}
                <div className='flex flex-wrap items-center border-b border-gray-200'>
                    {dataArray.map((tab) => (
                        <button
                            onClick={() => setCurrentTab(tab.label)}
                            key={tab.label}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${currentTab === tab.label ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <tab.icon className='w-5 h-5' />
                            <span>{tab.label}</span>
                            {tab.label === 'Pending' && tab.value.length > 0 && (
                                <span className='ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full'>{tab.value.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* User List */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'>
                    {status === 'loading' ? (
                        <Loading height="200px" />
                    ) : currentDisplayData.length > 0 ? (
                        currentDisplayData.map((user) => (
                           <div key={user._id} className='p-4 bg-white shadow-md rounded-lg flex flex-col'>
                            <div className='flex items-center gap-4'>
                                <img src={user.profile_picture} alt={`${user.full_name}'s profile`} className='rounded-full w-16 h-16' />
                                <div className='flex-1'>
                                    <p className='font-semibold text-gray-800'>{user.full_name}</p>
                                    <p className='text-sm text-gray-500'>@{user.username}</p>
                                </div>
                            </div>
                            <div className='mt-4 pt-4 border-t border-gray-100 flex-1 flex flex-col justify-end'>
                                <div className='flex gap-2'>
                                    <button onClick={() => navigate(`/profile/${user._id}`)} className='flex-1 py-2 text-sm rounded-md bg-indigo-600 text-white'>View Profile</button>
                                    {currentTab === 'Following' && <button onClick={() => handleUnfollow(user._id)} className='flex-1 py-2 text-sm rounded-md bg-gray-200 text-gray-700'>Unfollow</button>}
                                    {currentTab === 'Pending' && <button onClick={() => acceptConnection(user)} className='flex-1 py-2 text-sm rounded-md bg-gray-200 text-gray-700'>Accept</button>}
                                    {currentTab === 'Connections' && <button onClick={() => navigate(`/messages/${user._id}`)} className='flex-1 py-2 text-sm rounded-md bg-gray-200 text-gray-700 flex items-center justify-center gap-1'><MessageSquare className='w-4 h-4'/>Message</button>}
                                </div>
                            </div>
                           </div>
                        ))
                    ) : (
                        <div className="md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">
                            <p>No users to display in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Connections;