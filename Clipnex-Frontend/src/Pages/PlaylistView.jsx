import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPlaylistById, updatePlaylist, removeVideoFromPlaylist, deletePlaylist } from '../services/playlist.service';
import { PlaySquare, Edit2, Trash2, Video, X, Save, AlertTriangle } from 'lucide-react';
import VideoCard from '../Components/VideoCard';

function PlaylistView() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { theme, user } = useSelector(state => state.auth);
  const userData = user?.data;
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDeletePlaylistConfirm, setShowDeletePlaylistConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const containerClass = theme === 'dark' ? 'bg-darkbg' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' ? 'bg-fadetext/25' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const inputClass = theme === 'dark'
    ? 'bg-[#D9D9D9]/25 border-white/50 text-white placeholder-gray-400'
    : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500';

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        console.log('Fetching playlist:', playlistId);
        const response = await getPlaylistById(playlistId);
        console.log('Playlist response:', response);
        
        // Process videos to ensure creator information is properly structured
        if (response.data?.[0]) {
          const playlist = response.data[0];
          // Ensure each video has proper creator information and metadata
          playlist.videos = playlist.videos?.map(video => ({
            ...video,
            views: video.views || 0,
            duration: video.duration ? Number(video.duration) : 0,
            createdBy: {
              _id: video.createdBy?._id || video.owner?._id,
              username: video.createdBy?.username || video.owner?.username,
              fullname: video.createdBy?.fullname || video.owner?.fullname || video.owner?.username,
              avatar: video.createdBy?.avatar || video.owner?.avatar
            }
          }));
          setPlaylist(playlist);
          setEditData({
            name: playlist.name,
            description: playlist.description
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError(err.message || 'Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };

    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editData.name.trim() || !editData.description.trim()) return;

    try {
      setUpdating(true);
      const response = await updatePlaylist(playlistId, editData);
      setPlaylist(prev => ({ ...prev, ...response.data }));
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update playlist');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(playlistId, videoId);
      setPlaylist(prev => ({
        ...prev,
        videos: prev.videos.filter(v => v._id !== videoId)
      }));
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to remove video');
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      setDeleting(true);
      await deletePlaylist(playlistId);
      navigate('/playlists');
    } catch (err) {
      setError(err.message || 'Failed to delete playlist');
    } finally {
      setDeleting(false);
      setShowDeletePlaylistConfirm(false);
    }
  };

  const isPlaylistOwner = userData?._id === playlist?.createdBy?._id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pr-[15%]">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'dark' ? 'border-white' : 'border-gray-900'}`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pr-[15%]">
        <div className="text-center">
          <p className={`text-xl font-semibold mb-2 ${textClass}`}>Error loading playlist</p>
          <p className={subTextClass}>{error}</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center pr-[15%]">
        <p className={textClass}>Playlist not found</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerClass} pr-[15%]`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Playlist Header */}
        <div className={`${cardClass} rounded-lg border ${borderClass} p-6 mb-8`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <PlaySquare className={textClass} size={32} />
              {editing ? (
                <form onSubmit={handleUpdate} className="flex-grow">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg outline-none ${inputClass} mb-2`}
                    placeholder="Playlist name"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg outline-none ${inputClass} min-h-[100px] resize-y`}
                    placeholder="Playlist description"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X size={20} />
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      {updating ? <span className="animate-spin">⌛</span> : <Save size={20} />}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h1 className={`text-2xl font-bold ${textClass}`}>{playlist.name}</h1>
                  <p className={subTextClass}>{playlist.description}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!editing && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Edit2 size={20} className={subTextClass} />
                  </button>
                  <button
                    onClick={() => setShowDeletePlaylistConfirm(true)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Video className={subTextClass} size={20} />
              <span className={subTextClass}>{playlist.videos?.length || 0} videos</span>
            </div>
            {playlist.createdBy && (
              <div className="flex items-center gap-2">
                <img
                  src={playlist.createdBy.avatar}
                  alt={playlist.createdBy.username}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    e.target.src = '';
                    e.target.onerror = null;
                  }}
                />
                <span className={subTextClass}>{playlist.createdBy.fullname || playlist.createdBy.username}</span>
              </div>
            )}
          </div>
        </div>

        {/* Videos Grid */}
        {playlist.videos?.length === 0 ? (
          <div className={`text-center py-16 ${cardClass} rounded-lg border ${borderClass}`}>
            <Video className={`mx-auto ${subTextClass} mb-4`} size={48} />
            <p className={`${textClass} text-lg font-semibold mb-2`}>No videos in playlist</p>
            <p className={subTextClass}>Add videos to your playlist to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlist.videos.map((video) => (
              <div key={video._id} className="relative group">
                <VideoCard
                  video={video}
                  theme={theme}
                  onVideoClick={() => navigate(`/video/${video._id}`)}
                />
                {isPlaylistOwner && (
                  <button
                    onClick={() => setShowDeleteConfirm(video._id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Playlist Confirmation Modal */}
      {showDeletePlaylistConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${cardClass} rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border ${borderClass}`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className={`text-xl font-semibold ${textClass}`}>Delete Playlist</h3>
            </div>
            <p className={`mb-6 ${subTextClass}`}>
              Are you sure you want to delete this playlist? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeletePlaylistConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlaylist}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                {deleting ? (
                  <span className="animate-spin">⌛</span>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardClass} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${textClass}`}>Remove Video</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={`${subTextClass} hover:text-gray-400 transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
            <p className={`${textClass} mb-6`}>
              Are you sure you want to remove this video from the playlist?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={`px-4 py-2 rounded-lg border ${borderClass} ${textClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveVideo(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistView; 