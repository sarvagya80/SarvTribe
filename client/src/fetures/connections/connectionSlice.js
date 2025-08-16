// features/connections/connectionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api/axios';

const initialState = {
    connections: [],
    pendingRequests: [],
    followers: [],
    following: [],
    status: 'idle',
    error: null,
};

export const fetchUserNetwork = createAsyncThunk(
    'connections/fetchUserNetwork',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/user/network');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'An unexpected error occurred');
        }
    }
);

const connectionsSlice = createSlice({
    name: 'connections',
    initialState,
    // ✅ ADD THE MISSING REDUCERS HERE
    reducers: {
        clearConnections: (state) => {
            // This one was already here
            state.connections = [];
            state.pendingRequests = [];
            state.followers = [];
            state.following = [];
            state.status = 'idle';
            state.error = null;
        },
        optimisticallyAcceptConnection: (state, action) => {
            const userToAccept = action.payload;
            // Remove from pending
            state.pendingRequests = state.pendingRequests.filter(user => user._id !== userToAccept._id);
            // Add to connections
            state.connections.push(userToAccept);
        },
        optimisticallyUnfollow: (state, action) => {
            const userIdToUnfollow = action.payload;
            // Remove from the 'following' list
            state.following = state.following.filter(user => user._id !== userIdToUnfollow);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserNetwork.pending, (state) => {
                state.status = 'loading';
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

// ✅ EXPORT THE NEW ACTIONS AT THE BOTTOM
export const { 
    clearConnections, 
    optimisticallyAcceptConnection, 
    optimisticallyUnfollow 
} = connectionsSlice.actions;

export default connectionsSlice.reducer;