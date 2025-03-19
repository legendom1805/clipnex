import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Get user/channel details
export const getUserDetails = async (username) => {
  try {
    const response = await api.get(`/users/channel/${username}`);
    console.log("User details response:", response.data);
    
    if (!response.data || !response.data.data) {
      throw new Error("Invalid user data received");
    }

    const userData = response.data.data;
    return {
      statusCode: response.data.statusCode,
      data: {
        _id: userData._id,
        username: userData.username,
        fullname: userData.fullname,
        avatar: userData.avatar,
        coverImage: userData.coverImage,
        subscriberCount: userData.subscriberCount || 0,
        channelsSubscribedToCount: userData.channelsSubscribedToCount || 0,
        isSubscribed: userData.isSubscribed || false,
        email: userData.email,
      },
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
}; 