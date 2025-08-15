import React, { useState, useEffect, useRef } from 'react';
import { BadgeCheck, X } from 'lucide-react';

// Renamed component to PascalCase
const StoryViewers = ({ viewStory, setViewStory }) => {
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null); // Ref to access the video element

    // Effect for image/text story timer
    useEffect(() => {
        if (!viewStory || viewStory.media_type === "video") {
            setProgress(0); // Reset progress for videos
            return;
        }

        const duration = 10000; // 10 seconds for image/text stories
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

    // Handler for video progress
    const handleVideoProgress = () => {
        if (!videoRef.current) return;
        const { currentTime, duration } = videoRef.current;
        const calculatedProgress = (currentTime / duration) * 100;
        setProgress(calculatedProgress);
    };

    if (!viewStory) return null;

    const renderContent = () => {
        switch (viewStory.media_type) {
            case 'image':
                return <img src={viewStory.media_url} alt="Story Media" className='max-w-full max-h-[90vh] object-contain' />;
            case 'video':
                return (
                    <video
                        ref={videoRef}
                        onTimeUpdate={handleVideoProgress} // Update progress as video plays
                        onEnded={handleClose} // Close modal when video ends
                        src={viewStory.media_url}
                        className='max-h-[90vh] outline-none'
                        autoPlay // Correct casing
                    />
                );
            case 'text':
                return <div className='w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center'>{viewStory.content}</div>;
            default:
                return null;
        }
    };

    return (
        <div className='fixed inset-0 h-screen bg-black/90 z-50 flex items-center justify-center' style={{ backgroundColor: viewStory.media_type === "text" ? viewStory.background_color : '#000' }}>
            {/* --- Progress Bar --- */}
            <div className='absolute top-0 left-0 w-full h-1 bg-gray-700/50'>
                <div className='h-full bg-white transition-all duration-100 ease-linear' style={{ width: `${progress}%` }}></div>
            </div>

            {/* --- Header Info --- */}
            <div className='absolute top-4 left-4 flex items-center space-x-3 text-white'>
                <img src={viewStory.user?.profile_picture} alt="User" className='size-8 rounded-full object-cover border-2 border-white' />
                <div className="font-semibold flex items-center gap-1">
                    <span>{viewStory.user?.full_name}</span>
                    {/* Conditionally render the verified badge */}
                    {viewStory.user?.isVerified && <BadgeCheck size={16} className="text-white" />}
                </div>
            </div>

            {/* --- Close Button --- */}
            <button onClick={handleClose} aria-label="Close story viewer" className='absolute top-4 right-4 text-white p-2'>
                <X className='w-8 h-8 hover:scale-110 transition' />
            </button>

            {/* --- Main Content --- */}
            <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
                {renderContent()}
            </div>
        </div>
    );
};

export default StoryViewers;