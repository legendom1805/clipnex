import { api } from './api';

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