import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Get user/channel details
export const getUserDetails = async (username) => {
  try {
    const response = await api.get(`/users/c/${username}`);
    console.log("User details response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
}; 