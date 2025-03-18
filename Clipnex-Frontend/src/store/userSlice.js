import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create async thunk for fetching current user
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/users/current-user', {
        withCredentials: true
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user data');
    }
  }
);

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
  watchHistory: [],
  channelProfile: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    updateUserData: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    setWatchHistory: (state, action) => {
      state.watchHistory = action.payload;
    },
    setChannelProfile: (state, action) => {
      state.channelProfile = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUserData, updateUserData, setWatchHistory, setChannelProfile } = userSlice.actions;
export default userSlice.reducer; 