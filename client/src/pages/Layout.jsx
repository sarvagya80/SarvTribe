import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react'; // Import useUser
import { Menu, X } from 'lucide-react';

import SideBar from '../components/SideBar';
import Loading from '../components/Loading';

const Layout = () => {
  const { isSignedIn, isLoaded } = useUser(); // Use Clerk's hook
  const [sideBarOpen, setSideBarOpen] = useState(false);

  // 1. Wait until Clerk has finished loading its state
  if (!isLoaded) {
    return <Loading />;
  }

  // 2. If Clerk is loaded but the user is not signed in, redirect them to the login page
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3. If the user is signed in and Clerk is loaded, render the layout
  return (
    <div className='w-full flex h-screen'>
      <SideBar sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
      
      <div className='flex-1 bg-slate-50 overflow-y-auto'>
        <Outlet />
      </div>

      {/* Mobile sidebar toggle button (Slightly simplified) */}
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