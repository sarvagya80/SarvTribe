import React from 'react';
import { Image, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

import api from '../api/axios';

const CreatePost = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]); // Array of File objects
    const [imagePreviews, setImagePreviews] = useState([]); // Array of blob URLs
    const [loading, setLoading] = useState(false);
    
    const user = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const MAX_IMAGES = 4;

    // Effect to create and clean up blob URLs for previews
    useEffect(() => {
        const newPreviews = images.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);

        // Cleanup function to revoke URLs
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    const handleSubmit = async () => {
        if (!images.length && !content.trim()) {
            return toast.error('Please add content or at least one image.');
        }

        const formData = new FormData();
        formData.append('content', content);
        formData.append('post_type', images.length > 0 ? 'image' : 'text');
        images.forEach((imageFile) => {
            formData.append('images', imageFile);
        });

        const token = await getToken();
        await api.post('/api/post/add', formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/'); // Navigate on success
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > MAX_IMAGES) {
            return toast.error(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        }
        // Append new files to the existing ones
        setImages(prevImages => [...prevImages, ...files]);
    };

    const handleImageRemove = (indexToRemove) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    };

    // Show a loading or null state until the user profile is available
    if (!user) {
        return null; // Or a skeleton loader
    }

    return (
        <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
            <div className='max-w-2xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-bold text-gray-900'>Create Post</h1>
                    <p className='text-gray-600'>Share your thoughts with the community.</p>
                </div>
                <div className='bg-white p-4 rounded-xl shadow-md space-y-4'>
                    <div className='flex items-center gap-3'>
                        <img src={user.profile_picture} className='w-12 h-12 rounded-full' alt={`${user.full_name}'s profile`} />
                        <div>
                            <h2 className='font-semibold'>{user.full_name}</h2>
                            <p className='text-sm text-gray-500'>@{user.username}</p>
                        </div>
                    </div>
                    <textarea
                        className='w-full resize-none min-h-[6rem] text-lg outline-none placeholder-gray-500'
                        placeholder={`What's on your mind, ${user.full_name.split(' ')[0]}?`}
                        onChange={(e) => setContent(e.target.value)}
                        value={content}
                    />
                    {imagePreviews.length > 0 && (
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4'>
                            {imagePreviews.map((previewUrl, i) => (
                                <div key={previewUrl} className='relative group aspect-square'>
                                    <img src={previewUrl} className='w-full h-full object-cover rounded-md' alt={`Preview ${i + 1}`} />
                                    <button
                                        onClick={() => handleImageRemove(i)}
                                        aria-label={`Remove image ${i + 1}`}
                                        className='absolute hidden group-hover:flex justify-center items-center inset-0 bg-black/50 rounded-md'
                                    >
                                        <X className='w-6 h-6 text-white' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className='flex items-center justify-between pt-3 border-t'>
                        <label htmlFor='images' className='p-2 rounded-full hover:bg-gray-100 cursor-pointer'>
                            <Image className='size-6 text-gray-500' />
                            <input type='file' id='images' accept='image/*' hidden multiple onChange={handleImageChange} />
                        </label>
                        <button
                            disabled={loading}
                            onClick={() => toast.promise(handleSubmit(), {
                                loading: 'Publishing...',
                                success: 'Post created successfully!',
                                error: 'Failed to create post.',
                            })}
                            className='font-semibold px-6 py-2 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                        >
                            {loading ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;