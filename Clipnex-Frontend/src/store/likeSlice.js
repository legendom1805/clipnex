import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as likeService from '../services/like.service';

// Thunk action to fetch liked videos
export const fetchLikedVideos = createAsyncThunk(
  'likes/fetchLikedVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await likeService.getLikedVideos();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk action to toggle video like
export const toggleLike = createAsyncThunk(
  'likes/toggleLike',
  async (videoId, { getState }) => {
    try {
      const response = await likeService.toggleVideoLike(videoId);
      console.log('Toggle like response:', response);
      
      // Determine if the video is liked based on the response message
      const isLiked = response.data === 'liked';
      
      return {
        videoId,
        isLiked,
        likes: response.likes
      };
    } catch (error) {
      throw error;
    }
  }
);

const initialState = {
  likedVideos: [],
  loading: false,
  error: null
};

const likeSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    clearLikes: (state) => {
      state.likedVideos = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchLikedVideos
      .addCase(fetchLikedVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLikedVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.likedVideos = action.payload;
      })
      .addCase(fetchLikedVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handle toggleLike
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { videoId, isLiked } = action.payload;
        
        if (isLiked) {
          state.likedVideos.push(videoId);
        } else {
          state.likedVideos = state.likedVideos.filter(id => id !== videoId);
        }
      });
  }
});

export const { clearLikes } = likeSlice.actions;
export default likeSlice.reducer; 