import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { unwrapResult } from '@reduxjs/toolkit'; // 👈 1. Import unwrapResult

import { updateUser } from '../fetures/user/userSlice';

const ProfileModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.data);

    const [editForm, setEditForm] = useState({
        username: user?.username || "",
        bio: user?.bio || "",
        location: user?.location || "",
        full_name: user?.full_name || "",
        profile_picture: null,
        cover_photo: null,
    });
    const [preview, setPreview] = useState({
        profile: user?.profile_picture || null,
        cover: user?.cover_photo || null,
    });
    
    useEffect(() => {
        return () => {
            if (preview.profile && preview.profile.startsWith('blob:')) URL.revokeObjectURL(preview.profile);
            if (preview.cover && preview.cover.startsWith('blob:')) URL.revokeObjectURL(preview.cover);
        };
    }, []);

    const handleFileChange = (e) => {
        const { id, files } = e.target;
        if (files[0]) {
            const newFile = files[0];
            const fieldName = id === 'profile_picture' ? 'profile' : 'cover';
            if (preview[fieldName] && preview[fieldName].startsWith('blob:')) {
                URL.revokeObjectURL(preview[fieldName]);
            }
            setEditForm(prev => ({ ...prev, [id]: newFile }));
            setPreview(prev => ({ ...prev, [fieldName]: URL.createObjectURL(newFile) }));
        }
    };

    // ✅ This is the new debugging version of the save handler
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const { full_name, username, bio, location, profile_picture, cover_photo } = editForm;
        
        formData.append("full_name", full_name);
        formData.append("username", username);
        formData.append("bio", bio);
        formData.append("location", location);
        if (profile_picture) formData.append("profile", profile_picture);
        if (cover_photo) formData.append("cover", cover_photo);

        toast.loading('Saving...');

        try {
            const resultAction = await dispatch(updateUser(formData));
            const originalPromiseResult = unwrapResult(resultAction);

            console.log("REDUX THUNK SUCCEEDED:", originalPromiseResult);
            toast.dismiss();
            toast.success('Profile saved!');
            onClose();

        } catch (rejectedValueOrSerializedError) {
            // This will catch and display the hidden error!
            console.error("REDUX THUNK FAILED:", rejectedValueOrSerializedError);
            toast.dismiss();
            toast.error("Could not save. Check the browser console for the error.");
        }
    };

    return (
        <div className='fixed inset-0 z-50 h-screen overflow-y-auto bg-black/60 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl relative my-8'>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className='text-2xl font-bold text-gray-900'>Edit Profile</h1>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-6 h-6 text-gray-600" /></button>
                    </div>
                    {/* ✅ The form now calls the new debugging handler directly */}
                    <form className='space-y-4' onSubmit={handleSaveProfile}>
                        {/* The form JSX from before is perfect and goes here */}
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Cover Photo</span>
                            <label htmlFor="cover_photo" className="mt-1 h-40 w-full rounded-lg bg-gray-100 flex items-center justify-center relative group cursor-pointer">
                                <img src={preview.cover || 'https://via.placeholder.com/800x200'} alt="Cover preview" className="w-full h-full object-cover rounded-lg"/>
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="w-8 h-8 text-white" /></div>
                            </label>
                            <input id="cover_photo" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div>
                             <span className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</span>
                             <label htmlFor="profile_picture" className="mt-1 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center relative group cursor-pointer">
                                <img src={preview.profile || 'https://via.placeholder.com/150'} alt="Profile preview" className="w-full h-full object-cover rounded-full"/>
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"><Pencil className="w-6 h-6 text-white" /></div>
                            </label>
                             <input id="profile_picture" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="full_name" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"/>
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <input type="text" id="username" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea id="bio" rows={3} value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" id="location" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;