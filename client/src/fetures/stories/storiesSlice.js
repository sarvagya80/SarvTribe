// src/features/stories/storiesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
    list: [],
    status: 'idle',
    error: null
};

export const fetchStories = createAsyncThunk('stories/fetchStories', async () => {
    const { data } = await api.get('/api/story');
    // The backend sends stories grouped by user, so we flatten them
    return data.stories?.flatMap(group => group.stories) || [];
});

// The action for creating a new story
export const createStory = createAsyncThunk(
    'stories/createStory',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/story/create', formData);
            return data.story;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create story.');
        }
    }
);

const storiesSlice = createSlice({
    name: 'stories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStories.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchStories.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // This logic automatically adds the new story to the list on success
            .addCase(createStory.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            });
    }
});

export default storiesSlice.reducer;