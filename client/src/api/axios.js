// src/api/axios.js

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL,
    // ✅ REMOVED: The default 'Content-Type' header that was causing the issue.
    // Axios will now correctly handle headers for file uploads automatically.
});

// This interceptor adds the authentication token to every request.
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await window.Clerk.session?.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error fetching Clerk token:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;