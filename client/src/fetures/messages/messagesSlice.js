import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api/axios';

const initialState = {
  messages: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ token, userId }, { rejectWithValue }) => {
    try {
      // Note the suggestion to change this to a GET request in your backend if possible
      const { data } = await api.post(
        "/api/message/get",
        { to_user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        return data.messages; // Return only the messages array
      } else {
        return rejectWithValue('Failed to fetch messages.');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'An error occurred while fetching messages');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      // To avoid duplicates from WebSocket + API call, you can check if the message already exists
      const exists = state.messages.find(msg => msg.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    resetMessages: (state) => {
      state.messages = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
        state.error = null; // Clear previous errors
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload; // The payload is now the messages array directly
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { addMessage, resetMessages } = messagesSlice.actions;
export default messagesSlice.reducer;