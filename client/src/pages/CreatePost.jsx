// src/pages/CreatePost.jsx

import React, { useState, useEffect } from 'react';
import { Image, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreatePost = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const user = useSelector((state) => state.user.data);
    const MAX_IMAGES = 4;

    // This useEffect is crucial to prevent memory leaks from image previews.
    useEffect(() => {
        const newPreviews = images.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
        
        // Cleanup function to revoke the object URLs when the component unmounts
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!images.length && !content.trim()) {
            return toast.error('Please add content or at least one image.');
        }

        const formData = new FormData();
        formData.append('content', content);
        const post_type = images.length > 0 
            ? (content.trim() ? 'text_with_image' : 'image') 
            : 'text';
        formData.append('post_type', post_type);
        
        images.forEach((imageFile) => {
            formData.append('images', imageFile);
        });
        
        setLoading(true);
        try {
            await api.post('/api/post/create', formData);
            toast.success('Post created successfully!');
            navigate('/'); // Navigate home on success
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > MAX_IMAGES) {
            return toast.error(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        }
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    if (!user) {
        // You can show a loading spinner here while the user data is being fetched
        return null; 
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-slate-900'>Create Post</h1>
                <p className='text-slate-600'>Share your thoughts with the community.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start gap-4">
                    <img src={user.profile_picture} alt="Your profile" className="w-12 h-12 rounded-full object-cover" />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${user.full_name.split(' ')[0]}?`}
                        className="w-full p-2 text-gray-800 border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] resize-none"
                    />
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img src={preview} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-md" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-between items-center border-t pt-4">
                    <label htmlFor="image-upload" className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-indigo-600" title="Add Photos">
                        <Image size={24} />
                        <input type="file" id="image-upload" multiple accept="image/*" hidden onChange={handleImageChange} />
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;