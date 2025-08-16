import React, { useEffect, useState } from "react";
import api from "../api/axios";
import StoryModal from "./StoryModel"; // Corrected component name casing

const StoriesBar = () => {
    const [stories, setStories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchStories = async () => {
        try {
            // ✅ CHANGED: No need to get token or pass headers. The Axios interceptor handles it.
            const { data } = await api.get("/api/story");
            // In App.jsx we grouped stories by user, so the payload is different.
            // This component expects a flat array, so let's flatten it.
            const flatStories = data.stories?.flatMap(group => group.stories) || [];
            setStories(flatStories);
        } catch (err) {
            console.error("Error fetching stories:", err);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []); // Removed getToken from dependency array as it's not used

    // The rest of your JSX is great! No changes needed.
    return (
        <div className="flex space-x-4 p-4 bg-white shadow rounded-lg overflow-x-auto">
            <div
                onClick={() => setIsModalOpen(true)}
                className="w-24 h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-indigo-400 rounded-lg hover:bg-indigo-50 flex-shrink-0"
            >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white text-2xl font-bold">
                    +
                </div>
                <p className="text-sm mt-2 text-gray-700 font-medium">Create Story</p>
            </div>
            
            {/* ... your stories mapping JSX is great ... */}

            {isModalOpen && (
                <StoryModal
                    onClose={() => setIsModalOpen(false)}
                    refreshStories={fetchStories}
                />
            )}
        </div>
    );
};

export default StoriesBar;