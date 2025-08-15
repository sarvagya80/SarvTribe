import { configureStore } from '@reduxjs/toolkit';
// Corrected import paths
import userReducer from '../fetures/user/userSlice.js';
import connectionsReducer from '../fetures/connections/connectionSlice.js';
import messagesReducer from '../fetures/messages/messagesSlice.js';

export const store = configureStore({
    reducer: {
        user: userReducer,
        connections: connectionsReducer,
        // Renamed for consistency
        messages: messagesReducer
    }
});