// app/Store.js
import { configureStore } from '@reduxjs/toolkit';
// Corrected import paths from "fetures" to "features"
import userReducer from '../fetures/user/userSlice.js';
import connectionsReducer from '../fetures/connections/connectionSlice.js';
import messagesReducer from '../fetures/messages/messagesSlice.js';

export const store = configureStore({
    reducer: {
        user: userReducer,
        connections: connectionsReducer,
        messages: messagesReducer,
    }
});