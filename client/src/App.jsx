import React from 'react';
import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';

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

// Redux Thunks
import { fetchMe } from './fetures/user/userSlice';
import { fetchUserNetwork } from './fetures/connections/connectionSlice';
import { fetchConversations } from './fetures/conversations/conversationsSlice';
import { addMessage } from './fetures/messages/messagesSlice';
import { fetchStories } from './fetures/stories/storiesSlice';

const ProtectedRoute = ({ children }) => {
    const { isSignedIn, isLoaded } = useUser();
    if (!isLoaded) {
        return <Loading />;
    }
    return isSignedIn ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
            path="/" 
            element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }
        >
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
);

const App = () => {
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const dispatch = useDispatch();
    const userStatus = useSelector((state) => state.user.status);
    const { pathname } = useLocation();
    const pathnameRef = useRef(pathname);

    useEffect(() => {
        if (isSignedIn && userStatus === 'idle') {
            dispatch(fetchMe());
            dispatch(fetchUserNetwork());
            dispatch(fetchConversations());
            dispatch(fetchStories());
        }
    }, [isSignedIn, userStatus, dispatch]);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // --- Real-Time Messaging and Notifications Setup (SSE) ---
    useEffect(() => {
        let eventSource;
        const setupEventSource = async () => {
            if (isSignedIn) {
                const token = await getToken();
                if (!token) return;
                const eventSourceUrl = `${import.meta.env.VITE_BASEURL}/api/message/stream?token=${token}`;
                eventSource = new EventSource(eventSourceUrl);

                // ✅ Listener for NEW MESSAGES
                eventSource.addEventListener('newMessage', (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (pathnameRef.current.includes(`/messages/${message.from_user_id._id}`)) {
                            dispatch(addMessage(message));
                        } else {
                            toast.custom((t) => <Notification t={t} message={message} />);
                        }
                        dispatch(fetchConversations()); // Refresh conversation list
                    } catch (error) {
                        console.error('Failed to parse newMessage event:', error);
                    }
                });

                // ✅ Listener for NEW CONNECTION REQUESTS
                eventSource.addEventListener('newConnectionRequest', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        toast.success(data.message, { duration: 5000 });
                        dispatch(fetchUserNetwork()); // Refresh connection data to show new pending request
                    } catch (error) {
                        console.error('Failed to parse newConnectionRequest event:', error);
                    }
                });

                eventSource.onerror = (err) => {
                    console.error("EventSource connection error:", err);
                    eventSource.close();
                };
            }
        };
        setupEventSource();
        return () => {
            if (eventSource) eventSource.close();
        };
    }, [isSignedIn, getToken, dispatch]);

    if (isSignedIn && (userStatus === 'idle' || userStatus === 'loading')) {
        return <Loading />;
    }
    
    return (
        <>
            <Toaster position="bottom-right" />
            <AppRouter />
        </>
    );
};

export default App;