import React from 'react';
import moment from 'moment';
import { Calendar, MapPin, PenBox, Verified } from 'lucide-react';
import { useSelector } from 'react-redux';

const UserProfileInfo = ({ user, posts, setShowEdit }) => {
    // Get the currently logged-in user to compare IDs for the "Edit" button
    const currentUser = useSelector((state) => state.user.value);

    // Render a loading state or nothing if the main user prop isn't available yet
    if (!user) {
        // You could return a skeleton loader component here for a better UX
        return null;
    }

    const isOwnProfile = currentUser?._id === user._id;

    return (
        // Corrected px-6
        <div className='relative py-4 px-6 md:px-8 bg-white'>
            <div className='flex flex-col md:flex-row items-start gap-6'>
                <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full'>
                    {/* Added classes to make image fill the container */}
                    <img
                        src={user.profile_picture}
                        alt={`${user.full_name}'s profile`}
                        className='w-full h-full object-cover rounded-full z-20'
                    />
                </div>
                <div className='w-full pt-16 md:pt-0 md:pl-36'>
                    <div className='flex flex-col md:flex-row items-start justify-between'>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
                                {/* Render verified badge conditionally */}
                                {user.isVerified && <Verified className='w-6 h-6 text-blue-500' />}
                            </div>
                            <p className='text-gray-600'>{user.username ? `@${user.username}` : 'add a username'}</p>
                        </div>
                        {/* Use a more robust check for showing the edit button */}
                        {isOwnProfile &&
                            <button onClick={() => setShowEdit(true)} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0'>
                                <PenBox className='w-4 h-4' />Edit Profile
                            </button>
                        }
                    </div>

                    <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio || 'No bio available.'}</p>
                    
                    {/* Corrected gap class */}
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
                        <span className='flex items-center gap-1.5'>
                            <MapPin className='w-4 h-4' />
                            {user.location || 'Add location'}
                        </span>
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4' />
                            Joined <span className='font-medium'>{moment(user.createdAt).fromNow()}</span>
                        </span>
                    </div>

                    {/* Stats Section */}
                    <div className='flex items-center gap-6 mt-4 border-t border-gray-200 pt-4'>
                        <div>
                            {/* TODO: Modify backend to send user.postsCount instead of passing the whole posts array */}
                            <span className='sm:text-xl font-bold text-gray-900'>{posts.length}</span>
                            <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Posts</span>
                        </div>
                        <div>
                            <span className='sm:text-xl font-bold text-gray-900'>{user.followers?.length || 0}</span>
                            {/* Corrected "Followers" spelling */}
                            <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Followers</span>
                        </div>
                        <div>
                            <span className='sm:text-xl font-bold text-gray-900'>{user.following?.length || 0}</span>
                            <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Following</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileInfo;