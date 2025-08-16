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
    
    // ✅ CORRECTED: User data is in state.user.data
    const user = useSelector((state) => state.user.data);
    const MAX_IMAGES = 4;

    // Your useEffect for image previews is perfect.
    useEffect(() => {
        const newPreviews = images.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
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
        // Determine post_type based on content and images
        const post_type = images.length > 0 
            ? (content.trim() ? 'text_with_image' : 'image') 
            : 'text';
        formData.append('post_type', post_type);
        
        images.forEach((imageFile) => {
            formData.append('images', imageFile);
        });
        
        setLoading(true);
        // ✅ CHANGED: Correct endpoint and no manual headers
        await api.post('/api/post', formData);
        setLoading(false);
        navigate('/'); // Navigate home on success
    };
    
    // The rest of your JSX and image handlers are perfect.
    // ...
};

export default CreatePost;