import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';
import {assets } from '../assets/assets';
import api from '../api/axios';

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        // 1. Create an AbortController
        const controller = new AbortController();
        const { signal } = controller;

        const fetchFeeds = async () => {
            try {
                const token = await getToken();
                const { data } = await api.get("/api/post/feed", {
                    headers: { Authorization: `Bearer ${token}` },
                    // 2. Pass the signal to the request
                    signal: signal,
                });

                if (data.success) {
                    setFeeds(data.posts);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                // Don't show an error toast if the request was aborted
                if (error.name !== 'CanceledError') {
                    toast.error(error.message || 'Failed to fetch feed.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFeeds();

        // 3. The cleanup function aborts the request
        return () => {
            controller.abort();
        };
    }, [getToken]); // getToken is a stable function, so this still runs once

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="h-full overflow-y-auto no-scrollbar py-6 sm:py-10 flex justify-center gap-8 px-4">
            {/* Main Feed */}
            <main className="w-full lg:max-w-2xl">
                <StoriesBar />
                <div className="mt-6 space-y-6">
                    {feeds.length > 0 ? (
                        feeds.map((post) => <PostCard key={post._id} post={post} />)
                    ) : (
                        <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold">Your feed is empty</h3>
                            <p>Follow people or explore the discover page to see new posts.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className='sticky top-6 hidden xl:block w-full max-w-xs space-y-4'>
                <div className='bg-white p-4 rounded-lg shadow-sm'>
                    <h3 className='text-sm text-gray-500 font-semibold mb-2'>Sponsored</h3>
                    <img
                        src={assets.sponsored_img}
                        onError={(e) => e.currentTarget.src = '/fallback.jpg'} // Use currentTarget for safety
                        className='w-full h-auto aspect-video object-cover rounded-md'
                        alt="Sponsored"
                    />
                    <p className='font-semibold mt-2 text-gray-800'>Supercharge Your Marketing</p>
                    <p className='text-xs text-gray-500'>
                        Grow your business with a powerful, easy-to-use platform.
                    </p>
                </div>
                <RecentMessages />
            </aside>
        </div>
    );
};

export default Feed;