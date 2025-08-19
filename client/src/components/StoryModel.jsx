// src/components/StoryModal.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Sparkle, Upload, TextIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// Import the Redux Thunk for creating a story
import { createStory } from '../fetures/stories/storiesSlice';

// The 'refreshStories' prop is no longer needed
const StoryModal = ({ onClose }) => { 
    const dispatch = useDispatch();
    const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"];
    const [mode, setMode] = useState('text');
    const [background, setBackground] = useState(bgColors[0]);
    const [media, setMedia] = useState(null);
    const [text, setText] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    const MAX_VIDEO_DURATION = 60; // in seconds
    const MAX_VIDEO_SIZE_MB = 50; // in MB

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith("video")) {
            if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                return toast.error(`Video file size cannot exceed ${MAX_VIDEO_SIZE_MB} MB.`);
            }
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > MAX_VIDEO_DURATION) {
                    toast.error(`Video duration cannot exceed ${MAX_VIDEO_DURATION} seconds.`);
                } else {
                    setMedia(file);
                    setPreviewUrl(URL.createObjectURL(file));
                    setText("");
                    setMode("media");
                }
            };
            video.src = URL.createObjectURL(file);
        } else if (file.type.startsWith("image")) {
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
            setText("");
            setMode("media");
        }
    };

    const handleCreateStory = async () => {
        const media_type = mode === 'media'
            ? (media?.type.startsWith('image') ? 'image' : "video")
            : "text";

        if (media_type === "text" && !text.trim()) {
            throw new Error("Please enter some text.");
        }
        if (media_type !== 'text' && !media) {
            throw new Error("Please select a file.");
        }

        let formData = new FormData();
        formData.append('content', text);
        formData.append('media_type', media_type);
        if (media) formData.append('media', media);
        formData.append('background_color', background);

        // ✅ This now dispatches the Redux action.
        await dispatch(createStory(formData)).unwrap();
        onClose();
    };

    return (
        <div className='fixed inset-0 z-50 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-4 flex items-center justify-between'>
                    <button onClick={onClose} className='text-white p-2 cursor-pointer rounded-full hover:bg-white/10'>
                        <ArrowLeft />
                    </button>
                    <h2 className='text-lg font-semibold'>Create a Story</h2>
                    <span className='w-10'></span> {/* Spacer */}
                </div>

                <div className='rounded-lg h-96 flex items-center justify-center relative overflow-hidden' style={{ backgroundColor: background }}>
                    {mode === 'text' && (
                        <textarea
                            className='bg-transparent text-white w-full h-full p-6 text-2xl resize-none focus:outline-none text-center flex items-center justify-center'
                            placeholder='Start typing'
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                        />
                    )}
                    {mode === 'media' && previewUrl && (
                        media?.type.startsWith('image') ? (
                            <img src={previewUrl} alt="Media Preview" className='object-contain h-full w-full' />
                        ) : (
                            <video src={previewUrl} className='object-contain h-full w-full' controls autoPlay />
                        )
                    )}
                </div>

                <div className='flex items-center justify-center mt-4 gap-2'>
                    {bgColors.map((color) => (
                        <div 
                            key={color} 
                            className={`w-6 h-6 rounded-full ring-2 cursor-pointer transition-transform hover:scale-110 ${background === color ? 'ring-white' : 'ring-transparent'}`} 
                            style={{ backgroundColor: color }} 
                            onClick={() => setBackground(color)} 
                        />
                    ))}
                </div>

                <div className='flex gap-2 mt-4'>
                    <button
                        onClick={() => { setMode('text'); setMedia(null); setPreviewUrl(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-colors ${mode === 'text' ? 'bg-white text-black' : "bg-white/10 hover:bg-white/20"}`}
                    >
                        <TextIcon size={18} />Text
                    </button>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg font-semibold cursor-pointer transition-colors ${mode === 'media' ? 'bg-white text-black' : "bg-white/10 hover:bg-white/20"}`}>
                        <input onChange={handleMediaUpload} type='file' accept='image/*,video/*' className='hidden' />
                        <Upload size={18} />Photos/Videos
                    </label>
                </div>

                <button
                    onClick={() => toast.promise(handleCreateStory(), { 
                        loading: 'Creating story...',
                        success: 'Story created!',
                        error: (err) => err.message || 'Could not create story.'
                    })}
                    className='flex items-center justify-center gap-2 text-white font-bold py-3 mt-4 w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition'
                >
                    <Sparkle size={18} /> Create story
                </button>
            </div>
        </div>
    );
};

export default StoryModal;