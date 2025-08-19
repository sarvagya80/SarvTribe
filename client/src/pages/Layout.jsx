// src/pages/Layout.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SideBar from '../components/SideBar';

const Layout = () => {
    const [sideBarOpen, setSideBarOpen] = useState(false);

    return (
        <div className='w-full flex h-screen bg-gray-50'>
            <SideBar sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
            
            {/* The <main> tag contains the scrollable content area */}
            <main className='flex-1 overflow-y-auto'>
                {/* The Outlet is the placeholder where your pages (Feed, Profile, etc.) will be rendered */}
                <Outlet />
            </main>

            {/* A single, accessible button to toggle the mobile sidebar */}
            <button 
                className='absolute top-4 right-4 p-2 z-50 bg-white rounded-full shadow-md w-10 h-10 text-gray-600 sm:hidden flex items-center justify-center' 
                onClick={() => setSideBarOpen(!sideBarOpen)}
                aria-label={sideBarOpen ? "Close menu" : "Open menu"}
            >
                {sideBarOpen ? <X /> : <Menu />}
            </button>
        </div>
    );
};

export default Layout;