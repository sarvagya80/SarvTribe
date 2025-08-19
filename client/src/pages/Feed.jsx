import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import CreatorCredit from '../components/CreatorCredit';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';
import api from '../api/axios';

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchFeeds = async () => {
            try {
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
    }, []);

    if (loading) {
        return <Loading />;
    }
    
    return (
        <div className="h-full overflow-y-auto no-scrollbar py-6 sm:py-8 flex justify-center gap-8 px-4">
            <div className="flex-1 max-w-xl flex flex-col gap-6">
                <StoriesBar />
                
                {feeds.length > 0 ? (
                    feeds.map(post => <PostCard key={post._id} post={post} />)
                ) : (
                    <div className="text-center p-12 bg-white rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700">Your Feed is Empty</h3>
                        <p className="mt-1 text-gray-500">Create a post or follow people to see their posts here!</p>
                    </div>
                )}
            </div>
            
            {/* Right Sidebar */}
            <div className="w-80 hidden lg:block space-y-4">
                <RecentMessages />
                <CreatorCredit />

                {/* ✅ ADDED: Creator credit section */}
                <div className="text-center text-xs text-gray-400 p-4 bg-white rounded-lg shadow">
                    <p>Created by Sarvagya Pathak</p>
                    
                </div>
            </div>
        </div>
    );
};

export default Feed;