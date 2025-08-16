import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
// ✅ CORRECTED: Import path
import { updateUser } from '../fetures/user/userSlice';
import toast from 'react-hot-toast';

const ProfileModal = ({ setShowEdit }) => {
    const dispatch = useDispatch();
    // ✅ CORRECTED: The user data is in state.user.data
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
    
    // Your file handling and useEffect cleanup are perfect. No changes needed there.
    const handleFileChange = (e) => {
        const { id, files } = e.target;
        if (files[0]) {
            const newFile = files[0];
            const fieldName = id === 'profile_picture' ? 'profile' : 'cover';
            setEditForm(prev => ({ ...prev, [id]: newFile }));
            setPreview(prev => ({ ...prev, [fieldName]: URL.createObjectURL(newFile) }));
        }
    };

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
        const formData = new FormData(); // Renamed for clarity
        const { full_name, username, bio, location, profile_picture, cover_photo } = editForm;
        
        formData.append("full_name", full_name);
        formData.append("username", username);
        formData.append("bio", bio);
        formData.append("location", location);
        if (profile_picture) formData.append("profile", profile_picture);
        if (cover_photo) formData.append("cover", cover_photo);

        // ✅ CORRECTED: No need to pass the token here.
        // The thunk expects only the form data.
        await dispatch(updateUser(formData)).unwrap();
        setShowEdit(false);
    };

    // The rest of your JSX form is excellent. No changes needed.
    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-50 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-white rounded-lg shadow p-6'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>
                    <form className='space-y-4' onSubmit={(e) => toast.promise(handleSaveProfile(e), { loading: 'Saving...', success: 'Profile saved!', error: 'Could not save.' })}>
                        {/* ... your form JSX is perfect ... */}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;