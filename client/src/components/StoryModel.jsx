import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const StoryModal = ({ onClose, refreshStories }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("media", file);
        
        // This is a simple text story for now, can be expanded
        formData.append("media_type", file.type.startsWith('video') ? 'video' : 'image');

        try {
            // ✅ CHANGED: Correct endpoint and removed manual headers.
            // The Axios interceptor adds the auth token and FormData sets the correct Content-Type.
            await api.post("/api/story/create", formData);
            
            toast.success("Story uploaded!");
            refreshStories();
            onClose();
        } catch (err) {
            toast.error("Error uploading story. Please try again.");
            console.error("Error uploading story:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-4">Add a Story</h2>
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryModal;