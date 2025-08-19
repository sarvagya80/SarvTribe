// src/components/StoryViewers.jsx

import React, { useState, useEffect, useRef } from 'react';
import { BadgeCheck, X } from 'lucide-react';

const StoryViewers = ({ viewStory, setViewStory }) => {
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);

    useEffect(() => {
        if (!viewStory || viewStory.media_type === "video") {
            setProgress(0);
            return;
        }

        const duration = 7000; // 7 seconds for images
        const intervalTime = 50;
        let elapsed = 0;

        const progressInterval = setInterval(() => {
            elapsed += intervalTime;
            setProgress((elapsed / duration) * 100);
        }, intervalTime);

        const timer = setTimeout(() => {
            setViewStory(null);
        }, duration);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [viewStory, setViewStory]);

    const handleClose = () => {
        setViewStory(null);
    };

    const handleVideoProgress = () => {
        if (!videoRef.current || !videoRef.current.duration) return;
        const { currentTime, duration } = videoRef.current;
        setProgress((currentTime / duration) * 100);
    };

    if (!viewStory) return null;

    const renderContent = () => {
        switch (viewStory.media_type) {
            case 'image':
                return <img src={viewStory.media_url} alt="Story content" className='max-w-full max-h-[90vh] object-contain rounded-lg' />;
            case 'video':
                return (
                    <video
                        ref={videoRef}
                        onTimeUpdate={handleVideoProgress}
                        onEnded={handleClose}
                        src={viewStory.media_url}
                        className='max-h-[90vh] outline-none rounded-lg'
                        autoPlay
                    />
                );
            default:
                return (
                    <div className='w-full h-full flex items-center justify-center p-8 text-white text-2xl font-semibold text-center' style={{ backgroundColor: viewStory.background_color }}>
                        {viewStory.content}
                    </div>
                );
        }
    };

    return (
        // ✅ CRITICAL FIX: These classes create the full-screen overlay
        <div 
            className='fixed inset-0 h-screen w-screen bg-black/90 z-50 flex items-center justify-center p-4' 
            onClick={handleClose}
        >
            {/* This container prevents clicks on the story from closing it */}
            <div className='relative w-full h-full max-w-md max-h-[90vh]' onClick={e => e.stopPropagation()}>
                {/* --- Progress Bar --- */}
                <div className='absolute top-0 left-0 w-full h-1 bg-white/20 rounded-full'>
                    <div className='h-full bg-white rounded-full' style={{ width: `${progress}%` }}></div>
                </div>

                {/* --- Header Info --- */}
                <div className='absolute top-4 left-4 flex items-center space-x-3 text-white z-10'>
                    <img src={viewStory.user?.profile_picture} alt="User" className='size-10 rounded-full object-cover border-2 border-white/80' />
                    <div className="font-semibold flex items-center gap-1">
                        <span>{viewStory.user?.full_name}</span>
                        {viewStory.user?.isVerified && <BadgeCheck size={16} className="text-white" />}
                    </div>
                </div>

                {/* --- Close Button --- */}
                <button onClick={handleClose} aria-label="Close story viewer" className='absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10'>
                    <X className='w-8 h-8 hover:scale-110 transition' />
                </button>

                {/* --- Main Content --- */}
                <div className='w-full h-full flex items-center justify-center'>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default StoryViewers;
