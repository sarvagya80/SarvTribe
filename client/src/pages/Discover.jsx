import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

import UserCard from '../components/UserCard';
import Loading from '../components/Loading';
import api from '../api/axios';
import { useDebounce } from '../hooks/useDebounce.js'; // Import the custom hook

const Discover = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed
    const { getToken } = useAuth();

    // Use the debounce hook to delay the search
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

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
                const token = await getToken();
                const { data } = await api.post(
                    '/api/user/discover',
                    { input: debouncedSearchTerm },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (data.success) {
                    setUsers(data.users);
                } else {
                    toast.error(data.message || 'Something went wrong.');
                }
            } catch (error) {
                toast.error(error.message || 'An error occurred.');
            } finally {
                setLoading(false);
            }
        };

        searchUsers();
    }, [debouncedSearchTerm, getToken]); // This effect runs only when the debounced term changes

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Discover People</h1>
                    <p className="text-gray-600">Connect with amazing people and grow your network.</p>
                </div>

                <div className="mb-8 relative flex items-center">
                    <Search className="absolute left-4 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, username, bio, or location..."
                        className="pl-12 w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full">
                            <Loading height="200px" />
                        </div>
                    ) : (
                        users.map((user) => <UserCard user={user} key={user._id} />)
                    )}
                    
                    {/* Simplified empty state logic */}
                    {hasSearched && !loading && users.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <p className="text-lg">No users found for "{debouncedSearchTerm}"</p>
                            <p className="text-sm">Try searching for something else.</p>
                        </div>
                    )}

                    {!hasSearched && !loading && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                           <p>Search for users to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Discover;