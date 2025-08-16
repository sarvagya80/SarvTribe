// features/conversations/conversationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

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
    initialState: {
        list: [],
        status: 'idle',
        error: null
    },
    reducers: {},
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

export default conversationsSlice.reducer;