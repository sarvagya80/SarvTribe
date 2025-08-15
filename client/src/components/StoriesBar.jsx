import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

import StoryModal from './StoryModel';
import StoryViewers from './storyViewers';
import api from '../api/axios';

const StoriesBar = () => {
    const { getToken } = useAuth();
    const [stories, setStories] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingStory, setViewingStory] = useState(null);

    const fetchStories = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/story/get', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setStories(data.stories);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch stories.');
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    return (
        <div className='w-full lg:max-w-2xl no-scrollbar overflow-x-auto px-4'>
            <div className='flex gap-4 pb-5'>
                {/* Add Story card */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    aria-label="Create a new story"
                    className='rounded-lg shadow-sm min-w-[7.5rem] max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white'
                >
                    <div className='h-full flex flex-col items-center justify-center p-4'>
                        <div className='size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3'>
                            <Plus className='w-5 h-5 text-white' />
                        </div>
                        <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
                    </div>
                </button>

                {/* Stories */}
                {stories.map((story) => (
                    <button
                        onClick={() => setViewingStory(story)}
                        key={story._id} // Use stable ID for key
                        aria-label={`View story from ${story.user?.full_name}`}
                        className='relative rounded-lg shadow-sm min-w-[7.5rem] max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 text-left'
                    >
                        {/* Use optional chaining for safety */}
                        <img src={story.user?.profile_picture} alt={`${story.user?.full_name}'s profile`} className='absolute size-8 top-3 left-3 z-10 rounded-full ring-2 ring-gray-100 shadow' />
                        <p className='absolute top-16 left-3 text-white/80 text-sm truncate max-w-24 font-semibold'>{story.user?.full_name}</p>
                        <p className='text-white absolute bottom-1 right-2 z-10 text-xs font-light'>
                            {moment(story.createdAt).fromNow()}
                        </p>
                        
                        {(story.media_type !== "text") &&
                            <div className='absolute inset-0 z-0 rounded-lg bg-black overflow-hidden'>
                                {story.media_type === "image" ? (
                                    <img src={story.media_url} alt="Story Media" className='w-full h-full object-cover transition duration-500 opacity-60 group-hover:opacity-80 group-hover:scale-110' />
                                ) : (
                                    <video
                                        src={story.media_url}
                                        className='w-full h-full object-cover transition duration-500 opacity-60 group-hover:opacity-80 group-hover:scale-110'
                                        autoPlay
                                        muted
                                        loop
                                        playsInline // Essential for iOS
                                    />
                                )}
                            </div>
                        }
                    </button>
                ))}
            </div>

            {showCreateModal && <StoryModal setShowModel={setShowCreateModal} fetchStories={fetchStories} />}
            {viewingStory && <StoryViewers viewStory={viewingStory} setViewStory={setViewingStory} />}
        </div>
    );
}

export default StoriesBar;