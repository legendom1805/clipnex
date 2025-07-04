import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserPlaylists, createPlaylist } from '../services/playlist.service';
import { PlaySquare, Plus, FolderPlus, Video, X } from 'lucide-react';

function Playlists() {
  const navigate = useNavigate();
  const { theme, user } = useSelector(state => state.auth);
  const userData = user?.data;
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const containerClass = theme === 'dark' ? 'bg-darkbg' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' ? 'bg-fadetext/25' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const inputClass = theme === 'dark'
    ? 'bg-[#D9D9D9]/25 border-white/50 text-white placeholder-gray-400'
    : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500';

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!userData?._id) {
        console.log('No user data found, skipping playlist fetch');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching playlists for user:', userData._id);
        const response = await getUserPlaylists(userData._id);
        console.log('Playlists response:', response);
        setPlaylists(response.data || []);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        // Don't set error state, just set empty playlists
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [userData]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylist.name.trim() || !newPlaylist.description.trim()) {
      return;
    }

    try {
      setCreating(true);
      const response = await createPlaylist(newPlaylist);
      setPlaylists(prev => [...prev, response.data]);
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to create playlist:', err);
      // Don't show error to user, just log it
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pr-[15%]">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'dark' ? 'border-white' : 'border-gray-900'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerClass} pr-[15%]`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <PlaySquare className={textClass} size={32} />
            <h1 className={`text-2xl font-bold ${textClass}`}>Your Playlists</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus size={20} />
            Create Playlist
          </button>
        </div>

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className={`text-center py-16 ${cardClass} rounded-lg border ${borderClass}`}>
            <FolderPlus className={`mx-auto ${subTextClass} mb-4`} size={48} />
            <p className={`${textClass} text-lg font-semibold mb-2`}>No playlists yet</p>
            <p className={subTextClass}>Create your first playlist to organize your favorite videos</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className={`${cardClass} rounded-lg border ${borderClass} p-6 cursor-pointer hover:border-purple-500 transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <PlaySquare className={`${subTextClass} group-hover:text-purple-500 transition-colors`} size={24} />
                    <h3 className={`text-lg font-semibold ${textClass} group-hover:text-purple-500 transition-colors`}>
                      {playlist.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className={subTextClass} size={16} />
                    <span className={subTextClass}>{playlist.videos?.length || 0}</span>
                  </div>
                </div>
                <p className={`${subTextClass} line-clamp-2`}>{playlist.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${cardClass} p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 ${theme === 'dark' ? 'border-purple-500/50' : 'border-purple-500'}`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <FolderPlus className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
                <h3 className={`text-xl font-bold ${textClass}`}>Create New Playlist</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`${subTextClass} hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className={`block mb-2 font-medium ${textClass}`}>Name</label>
                  <input
                    type="text"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-500 transition-colors ${inputClass}`}
                    placeholder="Enter playlist name"
                  />
                </div>
                <div>
                  <label className={`block mb-2 font-medium ${textClass}`}>Description</label>
                  <textarea
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-500 transition-colors ${inputClass} min-h-[120px] resize-y`}
                    placeholder="Enter playlist description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-6 py-2.5 rounded-lg border-2 ${borderClass} ${textClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newPlaylist.name.trim() || !newPlaylist.description.trim()}
                  className={`px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg shadow-purple-500/20`}
                >
                  {creating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Playlist
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Playlists;
