import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await api.post("/users/logout");
    return response.data;
  } catch (error) {
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
    const response = await api.get("/users/current-user");
    return response.data;
  } catch (error) {
    throw error;
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
