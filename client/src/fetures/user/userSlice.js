import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../api/axios.js';

const initialState = {
    data: null,
    status: 'idle',
    error: null,
};

export const fetchMe = createAsyncThunk(
    'user/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/user/me');
            return data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data.');
        }
    }
);

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async (userData, { rejectWithValue }) => {
        try {
            const { data } = await api.patch('/api/user/update', userData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile.');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logoutUser: (state) => {
            state.data = null;
            state.status = 'idle';
            state.error = null;
        },
        startFollowing: (state, action) => {
            const userIdToFollow = action.payload;
            if (state.data && !state.data.following.includes(userIdToFollow)) {
                state.data.following.push(userIdToFollow);
            }
        },
        revertFollow: (state, action) => {
            const userIdToUnfollow = action.payload;
            if (state.data) {
                state.data.following = state.data.following.filter(id => id !== userIdToUnfollow);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMe.pending, (state) => { state.status = 'loading'; state.error = null; })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchMe.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
            
            // This is the critical section
            .addCase(updateUser.fulfilled, (state, action) => {
                // It correctly takes the successful response from the server (action.payload)
                // and updates the user data in the state from the 'user' property.
                state.status = 'succeeded';
                state.data = action.payload.user;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { logoutUser, startFollowing, revertFollow } = userSlice.actions;
export default userSlice.reducer;