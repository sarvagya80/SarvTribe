// src/pages/Login.jsx

import React from 'react';
import { assets } from '../assets/assets';
import { Star } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            {/* Background image */}
            <img src={assets.bgImage} alt="Abstract geometric background" className='absolute top-0 left-0 -z-10 w-full h-full object-cover' />

            {/* Left side branding */}
            <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40 text-gray-800'>
                <img src={assets.logo} alt="SarvTribe Logo" className='h-12 object-contain' />
                
                <div className="my-10 md:my-0">
                    <div className='flex items-center gap-3 mb-4'>
                        <img src={assets.group_users} alt="A group of people connected" className='h-8 md:h-10' />
                        <div>
                            <div className='flex'>
                                {Array(5).fill(0).map((_, i) => (
                                    <Star key={i} className='w-4 h-4 md:w-5 md:h-5 text-transparent fill-amber-500' aria-hidden="true" />
                                ))}
                            </div>
                            <p className="font-medium">Used by 12k+ developers</p>
                        </div>
                    </div>
                    <h1 className='text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-900 to-indigo-700 bg-clip-text text-transparent leading-tight'>
                        More than just friends—<br />truly connect
                    </h1>
                    <p className='text-xl md:text-2xl text-indigo-900 md:max-w-md mt-4'>
                        Connect with a global community on SarvTribe.
                    </p>
                </div>
                <div/> {/* Spacer to push content */}
            </div>

            {/* Right side login form */}
            <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
                <SignIn />
            </div>
        </div>
    );
};

export default Login;