import axios from 'axios';
// You might need to import your Redux store or a logout action
// import { store } from '../app/Store';
// import { logoutUser } from '../features/user/userSlice';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL,
    headers: {
      'Content-Type': 'application/json',
    }
});

// Intercept responses before they are handled by your components or thunks
api.interceptors.response.use(
  // If the response is successful (status 2xx), just return it
  (response) => response,
  
  // If the response is an error
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Here, you would dispatch a logout action to clear the user's state
      // and redirect them to the login page.
      // Example: store.dispatch(logoutUser());
      console.error("Authentication Error: Logging out user.", error);
      // You could also trigger a redirect here if needed
      // window.location.href = '/login';
    }
    
    // For all other errors, we'll just pass the error along
    // The .reject ensures the promise is rejected, triggering the .catch()
    // or the 'rejected' case in your async thunks.
    return Promise.reject(error);
  }
);

export default api;