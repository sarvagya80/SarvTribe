import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Edit, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

// ✅ CORRECTED: Import path and thunk name
import { fetchUserNetwork, optimisticallyUnfollow, optimisticallyAcceptConnection } from '../fetures/connections/connectionSlice';
import api from '../api/axios';
import Loading from '../components/Loading';

const Connections = () => {
    const [currentTab, setCurrentTab] = useState('Followers');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { connections, pendingRequests, followers, following, status } = useSelector(
        (state) => state.connections
    );
    
    // ✅ CORRECTED: Icon name from UserPen to Edit
    const dataArray = [
        { label: 'Followers', value: followers, icon: Users },
        { label: 'Following', value: following, icon: UserCheck },
        { label: 'Pending', value: pendingRequests, icon: Edit },
        { label: 'Connections', value: connections, icon: UserPlus },
    ];
    
    const handleUnfollow = async (targetUserId) => {
        // NOTE: Make sure `optimisticallyUnfollow` is implemented in your slice!
        // dispatch(optimisticallyUnfollow(targetUserId));
        try {
            // ✅ CORRECTED: API call simplified
            await api.post('/api/user/unfollow', { targetUserId });
            dispatch(fetchUserNetwork()); // Refetch to ensure state is accurate
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to unfollow.");
            // dispatch(revertUnfollow(targetUserId)); // Revert optimistic update
        }
    };

    const acceptConnection = async (requesterUser) => {
        // NOTE: Make sure `optimisticallyAcceptConnection` is implemented in your slice!
        // dispatch(optimisticallyAcceptConnection(requesterUser));
        try {
            const requesterId = requesterUser._id;
            // ✅ CORRECTED: API call simplified and endpoint/payload corrected
            await api.post('/api/user/connect/accept', { requesterId });
            dispatch(fetchUserNetwork()); // Refetch to update all lists
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept connection.");
            // dispatch(revertAccept(requesterUser)); // Revert optimistic update
        }
    };

    // This data fetching logic can now be removed, as it's handled in App.jsx
    // useEffect(() => {
    //     if (status === 'idle') {
    //         dispatch(fetchUserNetwork());
    //     }
    // }, [status, dispatch]);
    
    // The rest of your JSX is excellent.
    // ...
};

export default Connections;