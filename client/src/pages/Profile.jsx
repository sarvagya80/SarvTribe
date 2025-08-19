// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import Loading from '../components/Loading';
import UserProfileInfo from '../components/UserProfileInfo';
import PostCard from '../components/PostCard';
import ProfileModal from '../components/ProfileModel';
import api from '../api/axios';

const Profile = () => {
    const currentUser = useSelector((state) => state.user.data);
    const { profileId } = useParams();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEdit, setShowEdit] = useState(false); // This state controls the modal

    useEffect(() => {
        const fetchUserAndPosts = async (userId) => {
            setLoading(true);
            setError(null);
            try {
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
    }, [profileId, currentUser?._id]); 

    if (loading) return <Loading />;
    if (error || !user) return <div className="p-8 text-center text-gray-500">{error || 'User not found.'}</div>;

    return (
        <div className='h-full overflow-y-auto no-scrollbar pb-10'>
            <div className='max-w-3xl mx-auto'>
                {/* The UserProfileInfo component receives the function to open the modal */}
                <UserProfileInfo user={user} posts={posts} setShowEdit={setShowEdit} />
                
                <div className='mt-6'>
                    <div className='flex justify-center'>
                        <div className='bg-white rounded-xl shadow-sm p-1 flex space-x-1'>
                            {['posts', 'media', 'likes'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        activeTab === tab 
                                            ? "bg-indigo-600 text-white" 
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'posts' && (
                        <div className='mt-6 flex flex-col items-center gap-6'>
                            {posts.length > 0 ? (
                                posts.map((post) => <PostCard key={post._id} post={post} />)
                            ) : (
                                <p className="mt-8 text-gray-500">This user hasn't posted anything yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div> 
            
            {/* ✅ FIXED: Pass an `onClose` prop that sets the showEdit state to false. */}
            {showEdit && <ProfileModal onClose={() => setShowEdit(false)} />}
        </div>
    );
};

export default Profile;