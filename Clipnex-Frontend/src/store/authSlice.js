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
      // First get the login response which contains the token and user data
      const loginResponse = await authService.loginUser(credentials);
      console.log('Login response in thunk:', loginResponse);
      
      if (!loginResponse?.accessToken) {
        console.error('No token in login response:', loginResponse);
        return rejectWithValue({ success: false, error: 'No token received from login' });
      }

      // Return the user data with the correct structure
      return { 
        success: true, 
        user: {
          data: loginResponse.data.user // Wrap the user data in a data property
        }
      };
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      return rejectWithValue({ 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
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
      console.log('Checking auth status, token:', token ? 'exists' : 'not found');
      
      if (!token) {
        console.log('No token found in localStorage');
        return rejectWithValue('No token found');
      }

      // Set the token in axios defaults
      authService.setAuthToken(token);
      
      // Get current user data
      const userData = await authService.getCurrentUser();
      console.log('Current user data:', userData);

      if (!userData?.data) {
        console.error('Invalid user data received:', userData);
        authService.setAuthToken(null); // Clear invalid token
        return rejectWithValue('Invalid user data');
      }

      return {
        data: userData.data
      };
    } catch (error) {
      console.error('Auth check error:', error);
      // Only remove token if it's an authentication error (401)
      if (error.response?.status === 401) {
        console.log('Unauthorized, removing token');
        authService.setAuthToken(null);
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to check auth status');
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
        console.log('Login: pending');
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
        console.log('Login: fulfilled, user:', action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
        console.log('Login: rejected, error:', state.error);
      })
    
    // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Logout: pending');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
        console.log('Logout: fulfilled');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Logout failed';
        console.log('Logout: rejected, error:', state.error);
      })
    
    // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Auth check: pending');
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        console.log('Auth check: fulfilled, user:', action.payload);
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload;
        console.log('Auth check: rejected, error:', action.payload);
      });
  }
});

export const { toggleTheme } = authSlice.actions;
export default authSlice.reducer;
