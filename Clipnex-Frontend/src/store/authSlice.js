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
      
      if (!loginResponse?.accessToken) {
        return rejectWithValue({ success: false, error: 'Login failed. Please try again.' });
      }

      return { 
        success: true, 
        user: {
          data: loginResponse.data.user
        }
      };
    } catch (error) {
      // Map error messages to user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'User does not exist';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.data?.message) {
        // Use server message if available, but clean it up
        errorMessage = error.response.data.message
          .replace('Error: ', '')
          .replace('Request failed with status code ', '');
      }

      return rejectWithValue({ 
        success: false, 
        error: errorMessage
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
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        // Silent rejection for missing token
        return rejectWithValue({ silent: true, message: 'No token found' });
      }

      // Set the token in axios defaults
      authService.setAuthToken(token);
      
      // Get current user data
      const userData = await authService.getCurrentUser();

      if (!userData?.data) {
        authService.setAuthToken(null);
        // Silent rejection for invalid user data
        return rejectWithValue({ silent: true, message: 'Invalid user data' });
      }

      return {
        data: userData.data
      };
    } catch (error) {
      // Only remove token if it's an authentication error (401)
      if (error.response?.status === 401) {
        authService.setAuthToken(null);
      }
      // Silent rejection for auth errors
      return rejectWithValue({ 
        silent: true, 
        message: error.response?.data?.message || 'Failed to check auth status' 
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    clearError: (state) => {
      state.error = null;
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        // Only show user-facing errors
        state.error = action.payload?.error || 'Invalid email or password';
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
        // Don't clear error here to preserve login errors
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // Don't clear error here to preserve login errors
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        // Only set error if it's not a silent rejection
        if (!action.payload?.silent) {
          state.error = action.payload?.message;
        }
      });
  }
});

export const { toggleTheme, clearError } = authSlice.actions;
export default authSlice.reducer;
