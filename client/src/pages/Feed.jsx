import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';
import { assets } from '../assets/assets';
import api from '../api/axios';

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchFeeds = async () => {
            try {
                // ✅ CHANGED: Simplified API call. No need for manual token headers.
                const { data } = await api.get("/api/post/feed", { signal });

                if (data.success) {
                    setFeeds(data.posts);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                if (error.name !== 'CanceledError') {
                    toast.error(error.response?.data?.message || 'Failed to fetch feed.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFeeds();

        return () => {
            controller.abort();
        };
    }, []); // Dependency array is now empty

    if (loading) {
        return <Loading />;
    }
    
    // The rest of your JSX is perfect.
    return (
        <div className="h-full overflow-y-auto no-scrollbar py-6 sm:py-10 flex justify-center gap-8 px-4">
            {/* ... your JSX ... */}
        </div>
    );
};

export default Feed;