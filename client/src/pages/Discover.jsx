import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

import UserCard from '../components/UserCard';
import Loading from '../components/Loading';
import api from '../api/axios';
import { useDebounce } from '../hooks/useDebounce.js';

const Discover = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    
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
                // ✅ CHANGED: Simplified API call. Token is handled by the interceptor.
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

    // The rest of your JSX is perfect. No changes needed.
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            {/* ... your JSX ... */}
        </div>
    );
};

export default Discover;