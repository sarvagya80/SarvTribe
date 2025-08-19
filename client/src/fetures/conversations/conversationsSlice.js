// features/conversations/conversationsSlice.js (Corrected)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    list: [],
    status: 'idle',
    error: null
};

export const fetchConversations = createAsyncThunk(
    'conversations/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/message/conversations');
            return data.conversations;
        } catch (error) {
            return rejectWithValue('Failed to fetch conversations.');
        }
    }
);

const conversationsSlice = createSlice({
    name: 'conversations',
    initialState,
    reducers: {
        // ✅ ADDED: A reducer to clear state on logout for consistency.
        clearConversations: (state) => {
            state.list = [];
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { clearConversations } = conversationsSlice.actions; // ✅ Export the new action
export default conversationsSlice.reducer;