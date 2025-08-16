import axios from 'axios';

// ✅ REMOVED: The incorrect import for Clerk, as we'll use the global instance.
// import { Clerk } from '@clerk/clerk-react';

// ✅ REMOVED: The incorrect manual instantiation of Clerk.
// export const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercept REQUESTS before they are sent
api.interceptors.request.use(
    async (config) => {
        try {
            // ✅ CHANGED: Access the session token from the global window.Clerk instance.
            // This is the standard way to get the token outside of a React component.
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

// Intercept RESPONSES to handle global errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Authentication Error: The request was unauthorized.", error.response);
            // Clerk's <ClerkProvider> will handle the session timeout and redirect automatically.
        }
        return Promise.reject(error);
    }
);

export default api;