import { api } from "./api";

export const getVideoComments = async (videoId) => {
  try {
    console.log("Fetching comments for video:", videoId);
    const response = await api.get(
      `/api/v1/comments/video-comments/${videoId}`
    );
    console.log("Comments response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      "Error fetching comments:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addVideoComment = async (videoId, content) => {
  try {
    console.log("Adding comment:", { videoId, content });
    const response = await api.post(
      `/api/v1/comments/add-comment-video/${videoId}`,
      {
        content,
      }
    );
    console.log("Add comment response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      "Error adding comment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateComment = async (commentId, content) => {
  try {
    const response = await api.patch(
      `/api/v1/comments/update-comment/${commentId}`,
      {
        content,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "Error updating comment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(
      `/api/v1/comments/delete-comment/${commentId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "Error deleting comment:",
      error.response?.data || error.message
    );
    throw error;
  }
};
