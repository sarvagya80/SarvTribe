// src/pages/Discover.jsx

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

import UserCard from '../components/UserCard';
import Loading from '../components/Loading';
import api from '../api/axios';
import { useDebounce } from '../hooks/useDebounce.js'; // Assuming you have this custom hook

const Discover = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    
    // This custom hook prevents API calls on every keystroke
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const searchUsers = async () => {
            if (!debouncedSearchTerm.trim()) {
                setUsers([]);
                setHasSearched(false);
                return;
            }

            setLoading(true);
            setHasSearched(true);

            try {
                // The Axios interceptor handles authentication automatically
                const { data } = await api.post(
                    '/api/user/discover',
                    { input: debouncedSearchTerm }
                );

                if (data.success) {
                    setUsers(data.users);
                } else {
                    toast.error(data.message || 'Something went wrong.');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'An error occurred.');
            } finally {
                setLoading(false);
            }
        };

        searchUsers();
    }, [debouncedSearchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className='max-w-4xl mx-auto'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900'>Discover People</h1>
                    <p className='text-gray-600'>Connect with amazing people and grow your network.</p>
                </div>
                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Search for users by name or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 text-lg border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                </div>
                
                {loading && <Loading height="50vh"/>}

                {!loading && hasSearched && users.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No users found for "{debouncedSearchTerm}".</p>
                    </div>
                )}

                {!loading && users.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map(user => <UserCard key={user._id} user={user} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Discover;