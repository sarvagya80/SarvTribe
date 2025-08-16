import React, { useRef, useEffect } from 'react';
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

// Redux Thunks and Actions
import { fetchMe } from './fetures/user/userSlice';
import { fetchUserNetwork } from './fetures/connections/connectionSlice';
import { fetchConversations } from './fetures/conversations/conversationsSlice';
import { addMessage } from './fetures/messages/messagesSlice';

// A wrapper for protected routes that handles Clerk's loading state.
const ProtectedRoute = () => {
    const { isSignedIn, isLoaded } = useUser();
    if (!isLoaded) {
        return <Loading />;
    }
    return isSignedIn ? <Layout /> : <Navigate to="/login" replace />;
};

// This new component handles the main application view based on Redux state.
const AppContent = () => {
    const userStatus = useSelector((state) => state.user.status);
    const userError = useSelector((state) => state.user.error);
    const dispatch = useDispatch();

    // 1. If the essential user data is still loading, show a full-page spinner.
    if (userStatus === 'loading') {
        return <Loading />;
    }

    // 2. If the user data failed to load, show a clear error message.
    if (userStatus === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
                <h2 className="text-xl font-semibold text-red-600">Failed to Load Application Data</h2>
                <p className="text-gray-500 mt-2">{userError}</p>
                <button 
                    onClick={() => dispatch(fetchMe())} // Allow user to retry fetching their data
                    className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }
    
    // 3. If everything succeeded, render the application routes.
    return (
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
    );
};

const App = () => {
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const { pathname } = useLocation();
    const pathnameRef = useRef(pathname);
    const dispatch = useDispatch();

    // --- 1. Initial Data Fetching ---
    useEffect(() => {
        const loadInitialData = () => {
            if (isSignedIn) {
                dispatch(fetchMe());
                dispatch(fetchUserNetwork());
                dispatch(fetchConversations());
            }
        };
        loadInitialData();
    }, [isSignedIn, dispatch]);

    // --- 2. Pathname Tracking ---
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // --- 3. Real-Time Messaging Setup (SSE) ---
    useEffect(() => {
        let eventSource;
        const setupEventSource = async () => {
            if (isSignedIn) {
                const token = await getToken();
                if (!token) return;

                const eventSourceUrl = `${import.meta.env.VITE_BASEURL}/api/message/stream?token=${token}`;
                eventSource = new EventSource(eventSourceUrl);

                eventSource.addEventListener('newMessage', (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        
                        if (!pathnameRef.current.includes(`/messages/${message.from_user_id}`)) {
                             toast.custom((t) => <Notification t={t} message={message} />, { position: 'bottom-right' });
                        }
                        
                        dispatch(addMessage(message));
                        dispatch(fetchConversations());

                    } catch (error) {
                        console.error('Failed to parse message from EventSource:', error);
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
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [isSignedIn, getToken, dispatch]);

    return (
        <>
            <Toaster />
            <AppContent />
        </>
    );
};

export default App;