import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import searchService from '../services/search.service';

export const searchVideos = createAsyncThunk(
  'search/searchVideos',
  async ({ 
    query = "", 
    page = 1, 
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
    userId = null
  }, { rejectWithValue }) => {
    try {
      const videos = await searchService.searchVideos({
        query,
        page,
        limit,
        sortBy,
        sortType,
        userId
      });
      return {
        videos,
        query,
        page,
        hasMore: videos.length === limit
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  searchResults: [],
  loading: false,
  error: null,
  currentQuery: '',
  currentPage: 1,
  hasMore: true,
  totalResults: 0
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
      state.error = null;
      state.currentQuery = '';
      state.currentPage = 1;
      state.hasMore = true;
      state.totalResults = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.page === 1 
          ? action.payload.videos 
          : [...state.searchResults, ...action.payload.videos];
        state.currentQuery = action.payload.query;
        state.currentPage = action.payload.page;
        state.hasMore = action.payload.hasMore;
        state.totalResults = action.payload.videos.length;
      })
      .addCase(searchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer; 