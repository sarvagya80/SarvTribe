import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../api/axios.js';
// Toasts will be handled in the component, so we don't need to import it here.

const initialState = {
  value: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Refactor the fetchUser thunk to handle errors
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The controller now sends a 404 which will be caught below,
      // so we only need to return the user data on success.
      return data.user;
    } catch (error) {
      // Pass the backend's error message to the rejected action
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data.');
    }
  }
);

// Updates user profile data
export const updateUser = createAsyncThunk(
  'user/update',
  async ({ userData, token }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/user/update', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The thunk now returns the full data object on success
      // so the component can access the success message for the toast.
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
        // ... your other reducers like startFollowing ...
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.value = action.payload; // This is the user object
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload; // This will contain the error message
            });
        // ... your other extraReducers for updateUser etc.
    }
});

// This is the corrected line
export const { logoutUser, startFollowing, revertFollow } = userSlice.actions;
export default userSlice.reducer;