// src/components/UserProfileInfo.jsx

import React from 'react';
import moment from 'moment';
import { Calendar, MapPin, PenBox, Verified } from 'lucide-react';
import { useSelector } from 'react-redux';

const UserProfileInfo = ({ user, posts, setShowEdit }) => {
    const currentUser = useSelector((state) => state.user.data);

    // Prevents crashing while data is loading
    if (!user || !currentUser) {
        return null;
    }

    // The correct way to check if the user is viewing their own profile
    const isOwnProfile = currentUser._id === user._id;

    return (
        <div className='relative pt-4 px-6 md:px-8 bg-white shadow-md rounded-b-lg'>
            {/* Cover Photo */}
            <div 
                className="h-48 bg-gray-200 rounded-t-lg -mx-6 -mt-4" 
                style={{ 
                    backgroundImage: `url(${user.cover_photo || 'https://via.placeholder.com/1200x300'})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                }}
            ></div>

            <div className='flex flex-col md:flex-row items-start gap-6'>
                {/* Profile Picture */}
                <div className='-mt-16 flex-shrink-0'>
                    <img
                        src={user.profile_picture}
                        alt={`${user.full_name}'s profile`}
                        className='w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg'
                    />
                </div>
                
                <div className='w-full pt-2'>
                    <div className='flex flex-col md:flex-row items-start justify-between'>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
                                {user.isVerified && <Verified className='w-6 h-6 text-blue-500 fill-current' />}
                            </div>
                            <p className='text-gray-600'>@{user.username || 'no_username'}</p>
                        </div>
                        {isOwnProfile &&
                            <button onClick={() => setShowEdit(true)} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0'>
                                <PenBox className='w-4 h-4' />Edit Profile
                            </button>
                        }
                    </div>

                    <p className='text-gray-700 text-sm max-w-xl mt-4'>{user.bio || 'This user has not set a bio yet.'}</p>
                    
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
                        <span className='flex items-center gap-1.5'>
                            <MapPin className='w-4 h-4' />
                            {user.location || 'Location not set'}
                        </span>
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4' />
                            Joined {moment(user.createdAt).format('MMMM YYYY')}
                        </span>
                    </div>

                    <div className='flex items-center gap-6 mt-4 border-t border-gray-200 pt-4'>
                        <div>
                            <span className='text-lg font-bold text-gray-900'>{posts.length}</span>
                            <span className='text-sm text-gray-500 ml-1.5'>Posts</span>
                        </div>
                        <div>
                            <span className='text-lg font-bold text-gray-900'>{user.followers?.length || 0}</span>
                            <span className='text-sm text-gray-500 ml-1.5'>Followers</span>
                        </div>
                        <div>
                            <span className='text-lg font-bold text-gray-900'>{user.following?.length || 0}</span>
                            <span className='text-sm text-gray-500 ml-1.5'>Following</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileInfo;