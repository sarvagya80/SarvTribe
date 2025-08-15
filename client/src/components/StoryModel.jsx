import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkle, Upload, TextIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';

// Renamed component
const StoryModal = ({ setShowModel, fetchStories }) => {
    const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"];
    const [mode, setMode] = useState('text');
    const [background, setBackground] = useState(bgColors[0]);
    const [media, setMedia] = useState(null);
    const [text, setText] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const { getToken } = useAuth();

    const MAX_VIDEO_DURATION = 60; // seconds
    const MAX_VIDEO_SIZE_MB = 50; // MB

    // Effect to clean up the object URL and prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Revoke previous URL if it exists
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const setFile = (validFile) => {
            setMedia(validFile);
            setPreviewUrl(URL.createObjectURL(validFile));
            setText("");
            setMode("media");
        };

        if (file.type.startsWith("video")) {
            if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                return toast.error(`Video file size cannot exceed ${MAX_VIDEO_SIZE_MB} MB.`);
            }
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src); // Clean up the temporary video src
                if (video.duration > MAX_VIDEO_DURATION) {
                    toast.error("Video duration cannot exceed 1 minute.");
                } else {
                    setFile(file);
                }
            };
            video.src = URL.createObjectURL(file);
        } else if (file.type.startsWith("image")) {
            setFile(file);
        }
    };

    const handleCreateStory = async () => {
        const media_type = mode === 'media'
            ? media?.type.startsWith('image') ? 'image' : "video"
            : "text";

        if (media_type === "text" && !text.trim()) {
            // Use toast directly for simple validation
            return toast.error("Please enter some text for your story.");
        }
        if (media_type !== "text" && !media) {
            return toast.error("Please select a photo or video.");
        }

        const formData = new FormData();
        formData.append('content', text);
        formData.append('media_type', media_type);
        if (media) formData.append('media', media);
        formData.append('background_color', background);

        const token = await getToken();
        // The promise will be handled by toast.promise
        const { data } = await api.post('/api/story/create', formData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
            setShowModel(false);
            fetchStories();
            // Return a success message for toast.promise
            return "Story created successfully!";
        } else {
            // Throw an error to be caught by toast.promise
            throw new Error(data.message || "Failed to create story.");
        }
    };

    return (
        <div className='fixed inset-0 z-50 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-4 flex items-center justify-between'>
                    <button onClick={() => setShowModel(false)} aria-label="Close story creator" className='text-white p-2'>
                        <ArrowLeft />
                    </button>
                    <h2 className='text-lg font-semibold'>Create a Story</h2>
                    <span className='w-10'></span>
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
                            <img src={previewUrl} alt="Media Preview" className='object-contain w-full h-full' />
                        ) : (
                            <video src={previewUrl} className='object-contain w-full h-full' controls />
                        )
                    )}
                </div>

                {mode === 'text' &&
                    <div className='flex justify-center mt-4 gap-2'>
                        {bgColors.map((color) => (
                            <button key={color} aria-label={`Set background color to ${color}`} className={`w-6 h-6 rounded-full ring-2 cursor-pointer transition ${background === color ? 'ring-white' : 'ring-transparent'}`} style={{ backgroundColor: color }} onClick={() => setBackground(color)} />
                        ))}
                    </div>
                }

                <div className='flex gap-2 mt-4'>
                    <button
                        onClick={() => { setMode('text'); setMedia(null); setPreviewUrl(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${mode === 'text' ? 'bg-white text-black' : "bg-zinc-800"}`}
                    >
                        <TextIcon size={18} />Text
                    </button>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === 'media' ? 'bg-white text-black' : "bg-zinc-800"}`}>
                        <input onChange={handleMediaUpload} type='file' accept='image/*,video/*' className='hidden' />
                        <Upload size={18} />Photos/Videos
                    </label>
                </div>

                <button
                    onClick={() => toast.promise(handleCreateStory(), { loading: 'Creating story...', success: (message) => message, error: (err) => err.toString() })}
                    className='flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition'
                >
                    <Sparkle size={18} /> Create story
                </button>
            </div>
        </div>
    );
};

export default StoryModal;