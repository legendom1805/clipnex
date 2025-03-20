import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getChannelStats } from '../services/video.service';
import { Eye, ThumbsUp, Users, Calendar, Video } from 'lucide-react';

function YourAccount() {
  const navigate = useNavigate();
  const { theme, user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerClass = theme === 'dark' ? 'bg-darkbg' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' ? 'bg-fadetext/25' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch channel stats
        const statsResponse = await getChannelStats();
        console.log('Stats response:', statsResponse);
        setStats(statsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching channel stats:', err);
        setError(err.message || 'Failed to load channel stats');
      } finally {
        setLoading(false);
      }
    };

    if (user?.data) {
      fetchStats();
    }
  }, [user]);

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
          <p className={`text-xl font-semibold mb-2 ${textClass}`}>Error loading channel stats</p>
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
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${textClass}`}>Channel Overview</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Subscribers Card */}
            <div className={`${cardClass} rounded-lg p-6 border ${borderClass} hover:border-purple-500 transition-colors`}>
              <div className="flex items-center gap-3 mb-2">
                <Users className={subTextClass} size={24} />
                <h3 className={`text-lg font-semibold ${textClass}`}>Subscribers</h3>
              </div>
              <p className={`text-3xl font-bold ${textClass}`}>{stats?.subscribers || 0}</p>
              <p className={`mt-2 text-sm ${subTextClass}`}>People following your channel</p>
            </div>

            {/* Total Likes Card */}
            <div className={`${cardClass} rounded-lg p-6 border ${borderClass} hover:border-purple-500 transition-colors`}>
              <div className="flex items-center gap-3 mb-2">
                <ThumbsUp className={subTextClass} size={24} />
                <h3 className={`text-lg font-semibold ${textClass}`}>Total Likes</h3>
              </div>
              <p className={`text-3xl font-bold ${textClass}`}>{stats?.likes || 0}</p>
              <p className={`mt-2 text-sm ${subTextClass}`}>Likes across all videos</p>
            </div>

            {/* Total Views Card */}
            <div className={`${cardClass} rounded-lg p-6 border ${borderClass} hover:border-purple-500 transition-colors`}>
              <div className="flex items-center gap-3 mb-2">
                <Eye className={subTextClass} size={24} />
                <h3 className={`text-lg font-semibold ${textClass}`}>Total Views</h3>
              </div>
              <p className={`text-3xl font-bold ${textClass}`}>{stats?.views || 0}</p>
              <p className={`mt-2 text-sm ${subTextClass}`}>Views across all videos</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/upload')}
            className={`${cardClass} p-4 rounded-lg border ${borderClass} hover:border-purple-500 transition-colors flex items-center gap-3`}
          >
            <Video className="text-purple-500" size={24} />
            <span className={textClass}>Upload Video</span>
          </button>
          <button
            onClick={() => navigate('/yourvideos')}
            className={`${cardClass} p-4 rounded-lg border ${borderClass} hover:border-purple-500 transition-colors flex items-center gap-3`}
          >
            <Eye className="text-purple-500" size={24} />
            <span className={textClass}>View Your Videos</span>
          </button>
          <button
            onClick={() => navigate('/playlists')}
            className={`${cardClass} p-4 rounded-lg border ${borderClass} hover:border-purple-500 transition-colors flex items-center gap-3`}
          >
            <ThumbsUp className="text-purple-500" size={24} />
            <span className={textClass}>Manage Playlists</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`${cardClass} p-4 rounded-lg border ${borderClass} hover:border-purple-500 transition-colors flex items-center gap-3`}
          >
            <Users className="text-purple-500" size={24} />
            <span className={textClass}>Account Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default YourAccount;
