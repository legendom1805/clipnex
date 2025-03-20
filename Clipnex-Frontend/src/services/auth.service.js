import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Don't log token messages for auth routes
    const isAuthRoute = config.url?.includes('/login') || config.url?.includes('/register');
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (!isAuthRoute) {
        console.log('Adding token to request:', config.url);
      }
    } else if (!isAuthRoute) {
      // Only log missing token for non-auth routes
      console.log('No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting token refresh...');
      originalRequest._retry = true;
      try {
        const response = await refreshAccessToken();
        if (response?.data?.accessToken) {
          console.log('Token refresh successful');
          localStorage.setItem('accessToken', response.data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
      }
    }
    return Promise.reject(error);
  }
);

// Register a new user
export const registerUser = async (userData) => {
  try {
    // If userData is FormData, ensure proper headers
    const config = userData instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};

    const response = await api.post("/users/register", userData, config);
    
    // If registration is successful and we receive a token, set it
    if (response.data?.data?.accessToken) {
      setAuthToken(response.data.data.accessToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response || error);
    throw error;
  }
};

// Helper function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('accessToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    console.log('Attempting login with credentials:', { ...credentials, password: '[HIDDEN]' });
    const response = await api.post("/users/login", credentials);
    
    console.log('Raw login response:', response);
    console.log('Login response data:', response.data);
    
    // Get token from the nested data structure
    const accessToken = response.data.data.accessToken;
    
    if (!accessToken) {
      console.error('Access token not found in response:', response.data);
      throw new Error('');
    }

    console.log('Login successful, setting access token');
    setAuthToken(accessToken); // Use the helper function
    
    // Return the entire response data
    return {
      accessToken,
      data: response.data.data
    };
  } catch (error) {
    console.error('Login error:', error.response || error);
    // Clean up any existing token on login failure
    setAuthToken(null); // Use the helper function
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await api.post("/users/logout");
    setAuthToken(null); // Use the helper function
    return response.data;
  } catch (error) {
    // Clean up even if the request fails
    setAuthToken(null); // Use the helper function
    throw error;
  }
};

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    const response = await api.post("/users/refresh-token");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Return null instead of throwing error
      return null;
    }

    // Use the helper function to ensure token is set
    setAuthToken(token);
    
    const response = await api.get("/users/current-user");

    // Ensure we have valid user data
    if (!response.data?.data) {
      return null;
    }

    return {
      data: response.data.data
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    if (error.response?.status === 401) {
      setAuthToken(null);
    }
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.patch("/users/update-account", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post("/users/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post("/users/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('');
    }

    // Ensure token is set in headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Auth status check error:', error);
    // Clear token and headers on error
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
    throw error;
  }
};
