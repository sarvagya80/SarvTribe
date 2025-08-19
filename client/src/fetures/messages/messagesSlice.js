// features/messages/messagesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api/axios';

const initialState = {
    messages: [],
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
};

// This thunk fetches the chat history with a specific user.
export const fetchMessages = createAsyncThunk(
    "messages/fetchMessages",
    async (otherUserId, { rejectWithValue }) => { // It correctly takes the other user's ID.
        try {
            // It uses the correct, RESTful GET endpoint.
            const { data } = await api.get(`/api/message/chat/${otherUserId}`);
            if (data.success) {
                return data.messages;
            } else {
                return rejectWithValue('Failed to fetch messages.');
            }
        } catch (error) {
            // It gracefully handles any server or network errors.
            return rejectWithValue(error.response?.data?.message || 'An error occurred while fetching messages');
        }
    }
);

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        // Adds a new message from the real-time connection.
        addMessage: (state, action) => {
            // Prevents duplicate messages from being added.
            const exists = state.messages.find(msg => msg._id === action.payload._id);
            if (!exists) {
                state.messages.push(action.payload);
            }
        },
        // Resets the state when leaving a chat.
        resetMessages: (state) => {
            state.messages = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Handles all states of the fetchMessages thunk lifecycle.
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.messages = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { addMessage, resetMessages } = messagesSlice.actions;
export default messagesSlice.reducer;