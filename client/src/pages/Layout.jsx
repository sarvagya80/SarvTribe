import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import SideBar from '../components/SideBar';

// ✅ SIMPLIFIED: Removed all Clerk hooks and auth checks.
// This component's only job is to provide the layout.
// The ProtectedRoute in App.jsx ensures this component only renders for signed-in users.
const Layout = () => {
    const [sideBarOpen, setSideBarOpen] = useState(false);

    return (
        <div className='w-full flex h-screen bg-gray-50'>
            <SideBar sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
            
            <main className='flex-1 overflow-y-auto'>
                <Outlet />
            </main>

            {/* Mobile sidebar toggle button */}
            <button 
                className='absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden flex items-center justify-center' 
                onClick={() => setSideBarOpen(!sideBarOpen)}
                aria-label={sideBarOpen ? "Close menu" : "Open menu"}
            >
                {sideBarOpen ? <X /> : <Menu />}
            </button>
        </div>
    );
};

export default Layout;