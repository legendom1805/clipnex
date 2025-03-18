import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../services/auth.service';

const initialState = {
  user: null,
  loading: false,
  error: null,
  theme: 'dark'
};

// Thunk actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const loginResponse = await authService.loginUser(credentials);
      if (loginResponse) {
        const userData = await authService.getCurrentUser();
        console.log("User data after login:", userData);
        return { 
          success: true, 
          user: userData  // The data structure is already correct from getCurrentUser
        };
      }
      return rejectWithValue({ success: false, error: 'Login failed' });
    } catch (error) {
      console.error("Login error:", error);
      return rejectWithValue({ 
        success: false, 
        error: error.message || 'Login failed' 
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logoutUser();
      console.log("Logout successful:", response);
      return { success: true, message: response?.message };
    } catch (error) {
      console.error("Logout thunk error:", error);
      return rejectWithValue({ 
        success: false, 
        error: error.message || 'Logout failed',
        details: error.response?.data
      });
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await authService.getCurrentUser();
      console.log("Current user data in checkAuthStatus:", userData);
      return { user: userData }; // The data structure is already correct from getCurrentUser
    } catch (error) {
      console.error("Check auth status error:", error);
      // If it's a 401 error, just return null user without treating it as an error
      if (error.response?.status === 401) {
        return { user: null };
      }
      return rejectWithValue({ error: error.message });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
        console.log("Updated user state:", state.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })
    
    // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Logout failed';
      })
    
    // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
        console.log("Updated user state from check:", state.user);
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload?.error;
      });
  }
});

export const { toggleTheme } = authSlice.actions;
export default authSlice.reducer;
