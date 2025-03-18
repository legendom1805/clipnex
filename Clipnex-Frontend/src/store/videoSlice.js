import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as videoService from '../services/video.service';

// Thunk actions
export const fetchVideos = createAsyncThunk(
  'videos/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoService.getAllVideos();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecommendedVideos = createAsyncThunk(
  'videos/fetchRecommended',
  async (_, { rejectWithValue }) => {
    try {
      const response = await videoService.getRecommendedVideos();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  videos: [],
  recommendedVideos: [],
  loading: false,
  error: null
};

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearVideos: (state) => {
      state.videos = [];
    },
    updateVideoViews: (state, action) => {
      const { videoId } = action.payload;
      const video = state.videos.find(v => v._id === videoId);
      if (video) {
        video.views = (video.views || 0) + 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchVideos
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.data;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchRecommendedVideos
      .addCase(fetchRecommendedVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedVideos = action.payload.data;
      })
      .addCase(fetchRecommendedVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearVideos, updateVideoViews } = videoSlice.actions;
export default videoSlice.reducer; 