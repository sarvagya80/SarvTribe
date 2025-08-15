import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import moment from 'moment';
import toast from 'react-hot-toast';

import Loading from '../components/Loading';
import UserProfileInfo from '../components/UserProfileInfo';
import PostCard from '../components/PostCard';
import ProfileModal from '../components/ProfileModel';
import api from '../api/axios';

const Profile = () => {
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const { profileId } = useParams();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEdit, setShowEdit] = useState(false);

    // This function now correctly contains all the data-fetching logic.
    const fetchUserAndPosts = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const { data } = await api.get(`/api/user/profiles/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUser(data.profile);
                setPosts(data.posts);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError('Failed to load profile. Please try again.');
            toast.error(err.message || 'Profile not found.');
        } finally {
            setLoading(false);
        }
    };

    // The useEffect hook now correctly calls the data-fetching function.
    useEffect(() => {
        const userIdToFetch = profileId || currentUser?._id;
        
        if (userIdToFetch) {
            fetchUserAndPosts(userIdToFetch);
        }
    }, [profileId, currentUser]);

    if (loading) return <Loading />;
    if (error || !user) return <div className="text-center py-20 text-gray-500">{error || 'User not found.'}</div>;

    return (
        <div className='h-full overflow-y-auto bg-gray-50 pb-10'>
            <div className='max-w-4xl mx-auto'>
                <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                    <div className='h-48 md:h-64 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100'>
                        {user.cover_photo && <img src={user.cover_photo} alt="User Cover" className='w-full h-full object-cover' />}
                    </div>
                    <UserProfileInfo user={user} posts={posts} setShowEdit={setShowEdit} />
                </div>

                <div className='mt-8'>
                    <div className='bg-white rounded-lg shadow-sm p-1 max-w-sm mx-auto flex items-center justify-around'>
                        {['posts', 'media', 'likes'].map((tab) => (
                            <button
                                onClick={() => setActiveTab(tab)}
                                key={tab}
                                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6">
                        {activeTab === 'posts' && (
                            <div className='space-y-6 flex flex-col items-center'>
                                {posts.length > 0 ? posts.map((post) => <PostCard key={post._id} post={post} />) : <p className="text-gray-500 mt-8">No posts yet.</p>}
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-6'>
                                {posts.filter(p => p.image_urls?.length > 0).flatMap(post =>
                                    post.image_urls.map(image => (
                                        <Link to={image} key={image} target='_blank' rel="noopener noreferrer" className='relative group aspect-square'>
                                            <img src={image} alt='Post media' className='w-full h-full object-cover rounded-md' />
                                            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2'>
                                                <p className='text-xs text-white'>Posted {moment(post.createdAt).fromNow()}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'likes' && (
                            <div className='mt-8 text-center text-gray-500'>
                                <p>This feature is coming soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
        </div>
    );
};

export default Profile;