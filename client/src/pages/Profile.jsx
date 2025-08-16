import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import toast from 'react-hot-toast';

import Loading from '../components/Loading';
import UserProfileInfo from '../components/UserProfileInfo';
import PostCard from '../components/PostCard';
import ProfileModal from '../components/ProfileModel';
import api from '../api/axios';

const Profile = () => {
    // ✅ CORRECTED: User data is in state.user.data
    const currentUser = useSelector((state) => state.user.data);
    const { profileId } = useParams();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEdit, setShowEdit] = useState(false);

    useEffect(() => {
        const fetchUserAndPosts = async (userId) => {
            setLoading(true);
            setError(null);
            try {
                // ✅ CHANGED: Correct endpoint and no manual headers needed.
                const { data } = await api.get(`/api/user/${userId}`);

                if (data.success) {
                    setUser(data.profile);
                    setPosts(data.posts);
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                setError('Failed to load profile. Please try again.');
                toast.error(err.response?.data?.message || 'Profile not found.');
            } finally {
                setLoading(false);
            }
        };

        const userIdToFetch = profileId || currentUser?._id;
        
        if (userIdToFetch) {
            fetchUserAndPosts(userIdToFetch);
        }
    // Re-fetch when the profileId changes OR when the currentUser is first loaded
    }, [profileId, currentUser?._id]); 

    if (loading) return <Loading />;
    if (error || !user) return <div className="text-center py-20 text-gray-500">{error || 'User not found.'}</div>;

    // The rest of your JSX is perfect.
    return (
        <div className='h-full overflow-y-auto bg-gray-50 pb-10'>
            {/* ... your JSX ... */}
            {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
        </div>
    );
};

export default Profile;