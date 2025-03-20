import { api } from './api';

// Get all videos
export const getAllVideos = async () => {
  try {
    const response = await api.get("/videos/");
    console.log("Raw video data:", response.data?.data);

    // Ensure we have video data and it's an array
    if (!response.data?.data || !Array.isArray(response.data.data)) {
      console.log("No videos found or invalid data format");
      return { data: [] };
    }

    // Filter out non-video items and ensure proper video data structure
    const videos = response.data.data
      .filter(item => item.videoFile) // Only include items that have a video file
      .map((video) => ({
        ...video,
        duration: video.duration ? Number(video.duration) : 0,
        views: video.views || 0,
        likes: video.likes || 0,
        createdBy: {
          _id: video.createdBy?._id || video.owner?._id || video.owner,
          username: video.createdBy?.username || video.owner?.username || "",
          fullname: video.createdBy?.fullname || video.owner?.fullname || video.owner?.username || "",
          avatar: video.createdBy?.avatar || video.owner?.avatar || "",
        }
      }));

    console.log("Found", videos.length, "valid videos");
    console.log("Processed videos with creator info:", videos.map(v => ({ 
      title: v.title, 
      creator: v.createdBy 
    })));
    return { data: videos };
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

// Get video details by ID
export const getVideoDetails = async (videoId) => {
  try {
    const response = await api.get(`/videos/get-video/${videoId}`);
    console.log("Video details response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw error;
  }
};

// Upload a new video
export const uploadVideo = async (formData) => {
  try {
    const response = await api.post("/videos/upload-video", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    console.log("Upload response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
};

// Get user details
export const getUserDetails = async (username) => {
  try {
    // Get the channel profile using username
    const response = await api.get(`/users/c/${username}`, {
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
        _id: username,
        username: "Unknown User",
        fullname: "Unknown User",
        avatar: "",
        coverImage: "",
        subscriberCount: 0,
        isSubscribed: false,
      },
    };
  }
};

// Get channel profile
export const getChannelProfile = async (username) => {
  try {
    // Get the channel profile using username
    const response = await api.get(`/users/c/${username}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Channel profile response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching channel profile:", error);
    throw error;
  }
};

// Update video views
export const updateVideoViews = async (videoId) => {
  try {
    console.log("Making request to update views for video:", videoId);
    const response = await api.patch(`/videos/views/${videoId}`);
    console.log("Update views response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating video views:", error);
    throw error;
  }
};

// Get channel videos
export const getChannelVideos = async (username) => {
  try {
    console.log('Fetching channel videos for username:', username);
    const response = await api.get(`/users/channel/${username}`);
    console.log("Raw API response:", response);

    // Check if we have videos in the response
    if (!response.data?.data?.videos || !Array.isArray(response.data.data.videos)) {
      console.log("No channel videos found or invalid data format");
      return { data: [] };
    }

    // Process videos to ensure proper data structure
    const videos = response.data.data.videos
      .filter(item => {
        const hasVideoFile = Boolean(item.videoFile);
        if (!hasVideoFile) {
          console.log('Filtering out item without videoFile:', item);
        }
        return hasVideoFile;
      })
      .map((video) => {
        console.log('Processing video:', video);
        return {
          ...video,
          duration: video.duration ? Number(video.duration) : 0,
          views: video.views || 0,
          likes: video.likes || 0,
          createdBy: {
            _id: video.owner?._id || video.createdBy?._id,
            username: video.owner?.username || video.createdBy?.username || "",
            fullname: video.owner?.fullname || video.createdBy?.fullname || "",
            avatar: video.owner?.avatar || video.createdBy?.avatar || "",
          }
        };
      });

    console.log("Processed channel videos:", videos);
    return { data: videos };
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    throw error;
  }
};

// Get channel stats
export const getChannelStats = async () => {
  try {
    const response = await api.get('/dashboard/get-channel-stats');
    console.log('Channel stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching channel stats:', error);
    throw error;
  }
};

// Get our channel videos
export const getOurChannelVideos = async () => {
  try {
    const response = await api.get('/dashboard/get-channel-videos-our');
    console.log('Our channel videos response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching our channel videos:', error);
    throw error;
  }
};

// Get channel videos by name
export const getChannelVideosByName = async (channelName) => {
  try {
    const response = await api.get(`/dashboard/s/${channelName}`);
    console.log('Channel videos response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching channel videos by name:', error);
    throw error;
  }
};

// Delete video
export const deleteVideo = async (videoId) => {
  try {
    console.log('Deleting video:', videoId);
    const response = await api.post(`/videos/delete-video/${videoId}`);
    console.log('Delete video response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};
