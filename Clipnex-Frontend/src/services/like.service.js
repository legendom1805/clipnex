import { api } from "../Database/api";

export const toggleVideoLike = async (videoId) => {
  try {
    const response = await api.post(`/api/v1/likes/toggle-like-v/${videoId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleCommentLike = async (commentId) => {
  try {
    const response = await api.post(`/api/v1/likes/toggle-like-c/${commentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLikedVideos = async () => {
  try {
    const response = await api.get("/api/v1/likes/get-liked-v");
    return response.data;
  } catch (error) {
    throw error;
  }
};
