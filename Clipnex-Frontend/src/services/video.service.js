import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Get all videos
export const getAllVideos = async () => {
  try {
    const response = await api.get("/videos/");
    console.log("Raw video data:", response.data?.data);

    // Ensure durations are properly handled numbers
    if (response.data?.data) {
      response.data.data = response.data.data.map((video) => ({
        ...video,
        duration: video.duration ? Number(video.duration) : 0,
      }));
    }

    console.log("Found", response.data?.data?.length, "videos");
    return response.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

// Get video by ID
export const getVideoDetails = async (videoId) => {
  try {
    const response = await api.get(`/videos/get-video/${videoId}`);
    console.log("Video details response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching video:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Upload video
export const uploadVideo = async (formData, accessToken) => {
  try {
    const response = await api.post("/videos/upload-video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user details
export const getUserDetails = async (userId) => {
  try {
    // Get the channel profile directly using userId as username
    const response = await api.get(`/users/channel/${userId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Channel details response:", response.data);

    if (!response.data || !response.data.data) {
      throw new Error("Invalid channel data received");
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
        subscriberCount: userData.subscriberCount,
        isSubscribed: userData.isSubscribed,
      },
    };
  } catch (error) {
    console.error(
      "Error fetching user:",
      error.response?.data || error.message
    );
    // If channel not found, return a default user object
    return {
      statusCode: 200,
      data: {
        _id: userId,
        username: "Unknown User",
        fullname: "Unknown User",
        avatar: null,
        coverImage: null,
        subscriberCount: 0,
        isSubscribed: false,
      },
    };
  }
};

// Update video views
export const updateVideoViews = async (videoId) => {
  try {
    console.log("Making request to update views for video:", videoId);
    const response = await api.patch(`/videos/views/${videoId}`);
    console.log("Update views response:", response.data);

    if (!response.data || !response.data.data) {
      throw new Error("Invalid response from server");
    }

    return response.data;
  } catch (error) {
    console.error("Error in updateVideoViews:", error.response?.data || error);
    throw error.response?.data || error;
  }
};
