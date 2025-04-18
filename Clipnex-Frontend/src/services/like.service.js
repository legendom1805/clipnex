import { api } from "../Database/api";

export const toggleVideoLike = async (videoId) => {
  try {
    console.log('Toggling video like for video:', videoId);
    const response = await api.post(`/api/v1/likes/toggle-like-v/${videoId}`);
    console.log('Video like response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error toggling video like:', error.response?.data || error.message);
    throw error;
  }
};

export const getVideoLikes = async (videoId) => {
  try {
    console.log('Fetching video likes for video:', videoId);
    const response = await api.get(`/api/v1/likes/get-liked-v`);
    console.log('Video likes response:', response.data);
    
    // Check if we have data and it's an array
    if (!response.data?.data || !Array.isArray(response.data.data)) {
      return 0;
    }
    
    // Filter likes for the specific video
    const videoLikes = response.data.data.filter(like => {
      // Log the like object to see its structure
      console.log('Like object:', like);
      // Compare the video ID with the video's _id field in the like document
      return like.video?._id === videoId;
    });
    
    console.log('Found likes count for video:', videoLikes.length);
    return videoLikes.length;
  } catch (error) {
    console.error('Error fetching video likes:', error.response?.data || error.message);
    throw error;
  }
};

export const toggleCommentLike = async (commentId) => {
  try {
    console.log('Toggling comment like for comment:', commentId);
    const response = await api.post(`/api/v1/likes/toggle-like-c/${commentId}`);
    console.log('Comment like response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error toggling comment like:', error.response?.data || error.message);
    throw error;
  }
};

export const getLikedVideos = async () => {
  try {
    console.log('Fetching liked videos');
    const response = await api.get('/api/v1/likes/get-liked-v');
    console.log('Liked videos response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching liked videos:', error.response?.data || error.message);
    throw error;
  }
};
