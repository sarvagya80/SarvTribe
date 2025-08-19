import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

import StoryModal from "./StoryModel";
import StoryViewers from "./StoryViewers";
import { fetchStories } from "../fetures/stories/storiesSlice";
import Loading from "./Loading";

const StoriesBar = () => {
    const dispatch = useDispatch();
    const { list: stories, status } = useSelector((state) => state.stories);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [storyToView, setStoryToView] = useState(null);
    const scrollContainerRef = useRef(null); // Ref for the scrollable container

    // State to manage button visibility
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchStories());
        }
    }, [status, dispatch]);

    // Function to check if scrolling is possible
    const checkScroll = () => {
        const el = scrollContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 0);
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
        }
    };

    // Check scroll on mount, resize, and when stories change
    useEffect(() => {
        const el = scrollContainerRef.current;
        checkScroll();
        window.addEventListener('resize', checkScroll);
        el?.addEventListener('scroll', checkScroll);
        
        return () => {
            window.removeEventListener('resize', checkScroll);
            el?.removeEventListener('scroll', checkScroll);
        };
    }, [stories]);

    // Function to handle button clicks
    const handleScroll = (direction) => {
        const el = scrollContainerRef.current;
        if (el) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (status === 'loading') {
        return (
            <div className="h-44 flex items-center justify-center bg-white shadow rounded-lg px-4">
                <Loading size="10" height="auto" />
            </div>
        );
    }

    return (
        // ✅ ADDED: A relative wrapper to position the scroll buttons
        <div className="relative">
            {canScrollLeft && (
                <button 
                    onClick={() => handleScroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md border"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700"/>
                </button>
            )}
            <div 
                ref={scrollContainerRef}
                className="flex items-center space-x-4 p-4 h-44 bg-white shadow-lg rounded-lg overflow-x-auto no-scrollbar"
            >
                <div
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-24 h-36 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0 transition-colors"
                >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-transform hover:scale-105">
                        <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm mt-2 text-gray-700 font-medium">Create Story</p>
                </div>
                
                {stories && stories.filter(story => story && story.user).map((story) => (
                    <div 
                        key={story._id} 
                        onClick={() => setStoryToView(story)}
                        className="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden relative cursor-pointer group"
                    >
                        <img 
                            src={story.media_url || story.user.profile_picture} 
                            alt="Story thumbnail" 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <img src={story.user.profile_picture} alt={story.user.full_name} className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white" />
                        <p className="absolute bottom-2 left-0 right-0 text-white text-xs text-center font-semibold truncate px-1">{story.user.full_name}</p>
                    </div>
                ))}
            </div>
            {canScrollRight && (
                <button 
                    onClick={() => handleScroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md border"
                >
                    <ChevronRight className="w-6 h-6 text-gray-700"/>
                </button>
            )}

            {isCreateModalOpen && (
                <StoryModal onClose={() => setIsCreateModalOpen(false)} />
            )}
            {storyToView && (
                <StoryViewers
                    viewStory={storyToView}
                    setViewStory={setStoryToView}
                />
            )}
        </div>
    );
};

export default StoriesBar;