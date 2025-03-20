import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getChannelStats, getOurChannelVideos, deleteVideo } from '../services/video.service';
import { Eye, ThumbsUp, Users, Video, Calendar, Trash2, X } from 'lucide-react';
import VideoCard from '../Components/VideoCard';
import { toast } from 'react-hot-toast';

function YourVideos() {
  const navigate = useNavigate();
  const { theme, user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const containerClass = theme === 'dark' ? 'bg-darkbg' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' ? 'bg-fadetext/25' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch channel stats
        const statsResponse = await getChannelStats();
        console.log('Stats response:', statsResponse);
        setStats(statsResponse.data);

        // Fetch channel videos
        const videosResponse = await getOurChannelVideos();
        console.log('Videos response:', videosResponse);
        
        // Process videos to include creator information
        const processedVideos = videosResponse.data.map(video => ({
          ...video,
          createdBy: {
            _id: user?.data?._id,
            username: user?.data?.username,
            fullname: user?.data?.fullname || user?.data?.username,
            avatar: user?.data?.avatar,
            isSubscribed: false // No need to subscribe to own channel
          }
        }));
        setVideos(processedVideos);

        setError(null);
      } catch (err) {
        console.error('Error fetching channel data:', err);
        setError(err.message || 'Failed to load channel data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.data) {
      fetchData();
    }
  }, [user]);

  const handleDeleteVideo = async (videoId) => {
    try {
      setDeleting(true);
      await deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v._id !== videoId));
      setShowDeleteConfirm(null);
      
      // Enhanced success toast
      toast.success('Video deleted successfully', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          maxWidth: '400px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        }
      });
    } catch (err) {
      console.error('Error deleting video:', err);
      
      // Enhanced error toast
      toast.error(err.message || 'Failed to delete video', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          maxWidth: '400px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        }
      });
    } finally {
      setDeleting(false);
    }
  };

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
          <p className={`text-xl font-semibold mb-2 ${textClass}`}>Error loading channel data</p>
          <p className={subTextClass}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerClass} pr-[15%]`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Channel Stats */}
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${textClass} mb-6`}>Channel Overview</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${cardClass} rounded-lg p-6 border ${borderClass} hover:border-purple-500 transition-colors`}>
              <div className="flex items-center gap-3 mb-2">
                <Users className={subTextClass} size={24} />
                <h3 className={`text-lg font-semibold ${textClass}`}>Subscribers</h3>
              </div>
              <p className={`text-3xl font-bold ${textClass}`}>{stats?.subscribers || 0}</p>
            </div>

            <div className={`${cardClass} rounded-lg p-6 border ${borderClass} hover:border-purple-500 transition-colors`}>
              <div className="flex items-center gap-3 mb-2">
                <ThumbsUp className={subTextClass} size={24} />
                <h3 className={`text-lg font-semibold ${textClass}`}>Total Likes</h3>
              </div>
              <p className={`text-3xl font-bold ${textClass}`}>{stats?.likes || 0}</p>
            </div>

            <div className={`${cardClass} rounded-lg p-6 border ${borderClass} hover:border-purple-500 transition-colors`}>
              <div className="flex items-center gap-3 mb-2">
                <Eye className={subTextClass} size={24} />
                <h3 className={`text-lg font-semibold ${textClass}`}>Total Views</h3>
              </div>
              <p className={`text-3xl font-bold ${textClass}`}>{stats?.views || 0}</p>
            </div>
          </div>
        </div>

        {/* Videos Section */}
    <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${textClass}`}>Your Videos</h2>
            <div className="flex items-center gap-2">
              <Calendar className={subTextClass} size={20} />
              <span className={subTextClass}>Latest</span>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className={`text-center py-16 ${cardClass} rounded-lg border ${borderClass} hover:border-purple-500 transition-colors`}>
              <Video className={`mx-auto ${subTextClass} mb-4`} size={48} />
              <p className={`${textClass} text-lg font-semibold mb-2`}>No videos yet</p>
              <p className={subTextClass}>You haven't uploaded any videos</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Upload Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video._id} className="relative group">
                  <VideoCard
                    video={video}
                    theme={theme}
                    onVideoClick={() => navigate(`/video/${video._id}`)}
                  />
                  <button
                    onClick={() => setShowDeleteConfirm(video._id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200 scale-100 opacity-100 border-2 ${borderClass}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${textClass}`}>Delete Video</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={`${subTextClass} hover:text-gray-400 transition-colors p-2 hover:bg-gray-700/50 rounded-full`}
              >
                <X size={24} />
              </button>
            </div>
            <div className={`${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'} p-4 rounded-lg mb-6 border border-red-500/20`}>
              <p className={`${textClass} text-lg mb-2`}>
                Are you sure you want to delete this video?
              </p>
              <p className={`${subTextClass}`}>
                This action cannot be undone. The video will be permanently removed from your channel.
              </p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={`px-6 py-3 rounded-lg border ${borderClass} ${textClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-base font-medium`}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVideo(showDeleteConfirm)}
                disabled={deleting}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 text-base font-medium"
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    Delete Video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default YourVideos;
