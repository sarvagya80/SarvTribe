// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../fetures/user/userSlice';
import connectionReducer from '../fetures/connections/connectionSlice';
import conversationsReducer from '../fetures/conversations/conversationsSlice';
import messagesReducer from '../fetures/messages/messagesSlice';
import storiesReducer from '../fetures/stories/storiesSlice'; // 👈 1. Import the new reducer

export const store = configureStore({
  reducer: {
    user: userReducer,
    connections: connectionReducer,
    conversations: conversationsReducer,
    messages: messagesReducer,
    stories: storiesReducer, // 👈 2. Add it to the reducer object
  },
});
