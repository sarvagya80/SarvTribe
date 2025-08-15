import React from 'react';
import { Eye, MessageSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from '../components/Loading'; // Import your Loading component

const Messages = () => {
    // Select the entire slice state to get status and connections
    const { connections, status } = useSelector((state) => state.connections);
    const navigate = useNavigate();

    const renderContent = () => {
        if (status === 'loading') {
            return <Loading height="300px" />;
        }

        if (connections.length === 0) {
            return (
                <div className="text-center py-12 text-gray-500 bg-white shadow-sm rounded-lg">
                    <h3 className="text-lg font-semibold">Your inbox is empty</h3>
                    <p className="mt-1">You don't have any connections yet.</p>
                    <Link to="/discover" className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Find People to Connect With
                    </Link>
                </div>
            );
        }

        return connections.map((user) => (
            <div key={user._id} className='w-full max-w-xl flex items-center gap-4 p-4 bg-white shadow-sm rounded-lg'>
                <img src={user.profile_picture} className='rounded-full size-14' alt={`${user.full_name}'s profile`} />
                <div className='flex-1'>
                    <p className='font-semibold text-gray-800'>{user.full_name}</p>
                    <p className='text-sm text-gray-500'>@{user.username}</p>
                    {/* Truncate the bio to ensure consistent card height */}
                    <p className='text-sm text-gray-600 mt-1 truncate'>
                        {user.bio || 'No bio available.'}
                    </p>
                </div>
                <div className='flex flex-col gap-2'>
                    <button
                        onClick={() => navigate(`/messages/${user._id}`)}
                        aria-label={`Message ${user.full_name}`}
                        title={`Message ${user.full_name}`}
                        className='size-10 flex items-center justify-center rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                    >
                        <MessageSquare className='w-5 h-5' />
                    </button>
                    <button
                        onClick={() => navigate(`/profile/${user._id}`)}
                        aria-label={`View ${user.full_name}'s profile`}
                        title={`View ${user.full_name}'s profile`}
                        className='size-10 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600'
                    >
                        <Eye className='w-5 h-5' />
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900'>Messages</h1>
                    <p className='text-gray-600'>Start a conversation with your connections.</p>
                </div>
                <div className='flex flex-col items-center gap-4'>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Messages;