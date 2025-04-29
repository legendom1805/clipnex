import { api } from './api';

// Create a new playlist
export const createPlaylist = async (playlistData) => {
  try {
    const response = await api.post("/playlist/create-playlist", playlistData);
    console.log("Create playlist response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
};

// Get user playlists
export const getUserPlaylists = async (userId) => {
  try {
    console.log("Fetching playlists for user:", userId);
    const response = await api.get(`/playlist/get-user-playlists/${userId}`);
    console.log("User playlists response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    throw error;
  }
};

// Get playlist by ID
export const getPlaylistById = async (playlistId) => {
  try {
    const response = await api.get(`/playlist/get-playlist/${playlistId}`);
    console.log("Playlist details response:", response.data);

    // Process video data to ensure consistent format
    if (response.data?.data?.videos) {
      response.data.data.videos = response.data.data.videos.map(video => ({
        ...video,
        duration: video.duration ? Number(video.duration) : 0,
        views: video.views || 0,
        createdBy: {
          _id: video.owner?._id || video.owner,
          username: video.owner?.username || "",
          fullname: video.owner?.fullname || "",
          avatar: video.owner?.avatar || "",
        }
      }));
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching playlist:", error);
    throw error;
  }
};

// Add video to playlist
export const addVideoToPlaylist = async (playlistId, videoId) => {
  try {
    const response = await api.patch(`/playlist/add-video/${playlistId}/${videoId}`);
    console.log("Add video to playlist response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding video to playlist:", error);
    throw error;
  }
};

// Remove video from playlist
export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  try {
    const response = await api.patch(`/playlist/remove-video/${playlistId}/${videoId}`);
    console.log("Remove video from playlist response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error removing video from playlist:", error);
    throw error;
  }
};

// Update playlist
export const updatePlaylist = async (playlistId, updateData) => {
  try {
    const response = await api.patch(`/playlist/update-playlist/${playlistId}`, updateData);
    console.log("Update playlist response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating playlist:", error);
    throw error;
  }
};

// Delete playlist
export const deletePlaylist = async (playlistId) => {
  try {
    const response = await api.delete(`/playlist/delete-playlist/${playlistId}`);
    console.log("Delete playlist response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw error;
  }
}; 