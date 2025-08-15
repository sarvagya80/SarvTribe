import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../fetures/user/userSlice'; // Corrected path
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

// Renamed component to ProfileModal
const ProfileModal = ({ setShowEdit }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);

  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    full_name: user?.full_name || "",
    profile_picture: null, // This will hold the File object
    cover_photo: null, // This will hold the File object
  });

  // State for holding temporary preview URLs
  const [preview, setPreview] = useState({
    profile: user?.profile_picture || null,
    cover: user?.cover_photo || null,
  });

  const handleFileChange = (e) => {
    const { id, files } = e.target;
    if (files[0]) {
      const newFile = files[0];
      const fieldName = id === 'profile_picture' ? 'profile' : 'cover';
      
      setEditForm(prev => ({ ...prev, [id]: newFile }));
      setPreview(prev => ({ ...prev, [fieldName]: URL.createObjectURL(newFile) }));
    }
  };

  // Cleanup effect for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview.profile && preview.profile.startsWith('blob:')) {
        URL.revokeObjectURL(preview.profile);
      }
      if (preview.cover && preview.cover.startsWith('blob:')) {
        URL.revokeObjectURL(preview.cover);
      }
    };
  }, [preview.profile, preview.cover]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const userData = new FormData();
    const { full_name, username, bio, location, profile_picture, cover_photo } = editForm;
    
    userData.append("full_name", full_name);
    userData.append("username", username);
    userData.append("bio", bio);
    userData.append("location", location);
    if (profile_picture) userData.append("profile", profile_picture);
    if (cover_photo) userData.append("cover", cover_photo);

    const token = await getToken();
    
    // Dispatch and unwrap the result to handle success/error
    await dispatch(updateUser({ userData, token })).unwrap();
    setShowEdit(false); // Only close modal on success
  };

  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 z-50 h-screen overflow-y-scroll bg-black/50'>
      <div className='max-w-2xl sm:py-6 mx-auto'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>
          <form className='space-y-4' onSubmit={(e) => toast.promise(handleSaveProfile(e), { loading: 'Saving...', success: 'Profile saved!', error: 'Could not save.' })}>
            
            {/* Profile Picture */}
            <div className='flex flex-col items-start gap-3'>
              <label htmlFor='profile_picture' className='block text-sm font-medium text-gray-700 mb-1 cursor-pointer'> Profile Picture
                <input hidden type='file' accept='image/*' id='profile_picture' onChange={handleFileChange} />
                <div className='group/profile relative'>
                  <img src={preview.profile} className='w-24 h-24 rounded-full object-cover mt-2' alt="Profile Preview" />
                  <div className='absolute hidden group-hover/profile:flex inset-0 bg-black/20 rounded-full items-center justify-center'>
                    <Pencil className='w-5 h-5 text-white' />
                  </div>
                </div>
              </label>
            </div>

            {/* Cover Photo */}
            <div className='flex flex-col items-start gap-3'>
              <label htmlFor='cover_photo' className='block text-sm font-medium text-gray-700 mb-1 cursor-pointer'> Cover Photo
                <input hidden type='file' accept='image/*' id='cover_photo' onChange={handleFileChange} />
                <div className='group/cover relative'>
                  <img src={preview.cover} className='w-80 h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 object-cover mt-2' alt="Cover Preview" />
                  <div className='absolute hidden group-hover/cover:flex inset-0 bg-black/20 rounded-lg items-center justify-center'>
                    <Pencil className='w-5 h-5 text-white' />
                  </div>
                </div>
              </label>
            </div>
            
            {/* Text Inputs */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
              <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your full name' onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} value={editForm.full_name} />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
              <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your Username' onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} value={editForm.username} />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Bio</label>
              <textarea rows={3} className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your Bio' onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} value={editForm.bio} />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
              <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your Location' onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} value={editForm.location} />
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end space-x-3 pt-6'>
              <button onClick={() => setShowEdit(false)} type='button' className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'>Cancel</button>
              <button type='submit' className='px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition'>Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal; // Renamed export