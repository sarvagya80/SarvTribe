import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Assuming 'api' is your pre-configured Axios instance from 'src/api/axios.js'
import api  from '../../api/axios'; 

const initialState = {
  // Your data fields
  connections: [],
  pendingConnections: [],
  followers: [],
  following: [],
  // New fields to track status
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

// TIP: Instead of passing the token from the component every time,
// your Axios instance should ideally be configured to add it automatically.
// But for now, we will keep your existing structure.
export const fetchConnections = createAsyncThunk(
  'connections/fetchConnections',
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/user/connections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The API should ideally handle success/failure with HTTP status codes,
      // but this check works too.
      if (data.success) {
        return data;
      } else {
        // Use rejectWithValue to send a specific error message to the 'rejected' case
        return rejectWithValue('Failed to fetch connections.');
      }
    } catch (error) {
      // Handle network errors or server-side exceptions
      return rejectWithValue(error.response?.data?.message || 'An unexpected error occurred');
    }
  }
);

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  // Synchronous reducers for immediate state changes (e.g., optimistic updates)
  reducers: {
    // Example: You could add a reducer to clear connections on logout
    clearConnections: (state) => {
      state.connections = [];
      state.pendingConnections = [];
      state.followers = [];
      state.following = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Case for when the fetch is in progress
      .addCase(fetchConnections.pending, (state) => {
        state.status = 'loading';
      })
      // Case for when the fetch is successful
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The payload is the successful 'data' object from the thunk
        state.connections = action.payload.connections;
        state.pendingConnections = action.payload.pendingConnections;
        state.followers = action.payload.followers;
        state.following = action.payload.following;
      })
      // Case for when the fetch fails
      .addCase(fetchConnections.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // The error message from rejectWithValue
      });
  },
});

// This is the corrected line
export const { clearConnections, optimisticallyUnfollow, optimisticallyAcceptConnection } = connectionsSlice.actions;
export default connectionsSlice.reducer;