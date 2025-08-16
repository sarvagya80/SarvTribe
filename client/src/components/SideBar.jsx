import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import { CirclePlus } from 'lucide-react';
import MenuItems from './MenuItems';
import { UserButton } from '@clerk/clerk-react';
import { useSelector } from 'react-redux';
import Loading from './Loading';

function SideBar({ sideBarOpen, setSideBarOpen }) {
    const navigate = useNavigate();
    // ✅ CORRECTED: The user data is in state.user.data, not state.user.value
    const user = useSelector((state) => state.user.data);

    // The loading state logic is perfect.
    if (!user) {
        return (
            <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sideBarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
                <Loading height="100%" />
            </div>
        );
    }

    return (
        <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sideBarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
            <div className='w-full'>
                <img
                    onClick={() => {
                        navigate('/');
                        setSideBarOpen(false);
                    }}
                    src={assets.logo}
                    alt='SarvTribe Logo'
                    className='w-26 ml-7 my-2 cursor-pointer'
                />
                <hr className='border-gray-300 mb-8' />
                <MenuItems setSideBarOpen={setSideBarOpen} />

                <Link
                    to='/create-post'
                    className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white'
                    onClick={() => setSideBarOpen(false)}
                >
                    <CirclePlus className='w-5 h-5' />
                    Create Post
                </Link>
            </div>

            <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <UserButton afterSignOutUrl='/login' />
                    <div>
                        <h1 className='text-sm font-medium'>{user.full_name}</h1>
                        <p className='text-xs text-gray-500'>@{user.username}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SideBar;