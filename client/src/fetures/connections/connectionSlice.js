// features/connections/connectionSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api/axios';

const initialState = {
    connections: [],
    pendingRequests: [],
    followers: [],
    following: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

export const fetchUserNetwork = createAsyncThunk(
    'connections/fetchUserNetwork',
    async (_, { rejectWithValue }) => {
        try {
            // The Axios interceptor automatically handles the authentication token.
            const { data } = await api.get('/api/user/network');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user network.');
        }
    }
);

const connectionsSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        // Clears the state, typically on user logout.
        clearConnections: (state) => {
            state.connections = [];
            state.pendingRequests = [];
            state.followers = [];
            state.following = [];
            state.status = 'idle';
            state.error = null;
        },
        // Example of an optimistic update reducer.
        optimisticallyAcceptConnection: (state, action) => {
            const userToAccept = action.payload;
            state.pendingRequests = state.pendingRequests.filter(user => user._id !== userToAccept._id);
            state.connections.push(userToAccept);
        },
        optimisticallyUnfollow: (state, action) => {
            const userIdToUnfollow = action.payload;
            state.following = state.following.filter(user => user._id !== userIdToUnfollow);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserNetwork.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserNetwork.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.connections = action.payload.connections;
                state.pendingRequests = action.payload.pendingRequests;
                state.followers = action.payload.followers;
                state.following = action.payload.following;
            })
            .addCase(fetchUserNetwork.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { 
    clearConnections, 
    optimisticallyAcceptConnection, 
    optimisticallyUnfollow 
} = connectionsSlice.actions;

export default connectionsSlice.reducer;