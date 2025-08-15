import React, { useRef, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import api from './api/axios';

// Pages and Components
import Login from './pages/Login';
import Layout from './pages/Layout';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import ChatBox from './pages/ChatBox';
import Connections from './pages/Connections';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import Notification from './components/Notification';
import Loading from './components/Loading';

// Redux Slices
import { fetchUser } from './fetures/user/userSlice';
import { fetchConnections } from './fetures/connections/connectionSlice';
import { addMessage } from './fetures/messages/messagesSlice';

const ProtectedRoute = () => {
    const { isSignedIn, isLoaded } = useUser();
    if (!isLoaded) {
        return <Loading />;
    }
    return isSignedIn ? <Layout /> : <Navigate to="/login" replace />;
};

const App = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { pathname } = useLocation();
    const pathnameRef = useRef(pathname);
    const dispatch = useDispatch();

    // This is the final, correct data-fetching hook.
    useEffect(() => {
        const syncProfile = async () => {
            if (user) { // 'user' is from Clerk's useUser() hook
                const token = await getToken();
                try {
                    // Call the endpoint to ensure a profile exists in your database
                    const { data } = await api.post('/api/user/create-profile', {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (data.success && data.user) {
                        // Dispatch the user data to Redux
                        dispatch(fetchUser.fulfilled(data.user));
                        // Now that we have a user, fetch their connections
                        dispatch(fetchConnections(token));
                    } else {
                        throw new Error(data.message || "Failed to sync profile.");
                    }

                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to sync profile.");
                    dispatch(fetchUser.rejected(error.message));
                }
            }
        };
        syncProfile();
    }, [user, getToken, dispatch]);

    // This effect correctly tracks the pathname for the messaging service
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // This effect for real-time messaging is excellent as-is
    useEffect(() => {
        let eventSource;
        if (user) {
            eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id);
            eventSource.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    // A more robust check for the chat page
                    if (pathnameRef.current.includes(`/messages/${message.from_user_id._id}`)) {
                        dispatch(addMessage(message));
                    } else {
                        toast.custom((t) => <Notification t={t} message={message} />, { position: 'bottom-right' });
                    }
                } catch (error) {
                    console.error('Failed to parse message from EventSource:', error);
                }
            };
        }
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [user, dispatch]);

    return (
        <>
            <Toaster />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute />}>
                    <Route index element={<Feed />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="messages/:userId" element={<ChatBox />} />
                    <Route path="connections" element={<Connections />} />
                    <Route path="discover" element={<Discover />} />
                    <Route path="profile/:profileId" element={<Profile />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="create-post" element={<CreatePost />} />
                </Route>
            </Routes>
        </>
    );
};

export default App;