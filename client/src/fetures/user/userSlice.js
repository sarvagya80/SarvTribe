import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../api/axios.js';

const initialState = {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// ✅ RESTORED: Full implementation of async thunks
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
            return rejectWithValue(error.response?.data || 'Failed to update profile.');
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
            // Fetch Me
            .addCase(fetchMe.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchMe.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Update User
            .addCase(updateUser.pending, (state) => {
                // Optional: handle loading state for updates if needed
            })
            .addCase(updateUser.fulfilled, (state, action) => {
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