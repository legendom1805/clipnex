import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../services/user.service';
import { getChannelVideos } from '../services/video.service';
import { User } from 'lucide-react';
import VideoCard from '../Components/VideoCard';

function Channel() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.auth);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        // Fetch channel details
        const channelResponse = await getUserDetails(channelId);
        if (!channelResponse || !channelResponse.data) {
          throw new Error('No channel data received');
        }
        setChannel(channelResponse.data);

        // Fetch channel videos
        const videosResponse = await getChannelVideos(channelId);
        if (videosResponse && videosResponse.data) {
          setVideos(videosResponse.data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching channel data:', err);
        setError(err.message || 'Failed to load channel');
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      fetchChannelData();
    }
  }, [channelId]);

  const containerClass = theme === 'dark' ? 'bg-darkbg' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' ? 'bg-fadetext/25' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

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
          <p className={`text-xl font-semibold mb-2 ${textClass}`}>
            Error loading channel
          </p>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen flex items-center justify-center pr-[15%]">
        <p className={textClass}>Channel not found</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerClass} pr-[15%]`}>
      {/* Channel Header */}
      <div className={`${cardClass} mx-4 mb-6 p-6 rounded-lg shadow-lg`}>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={channel.username || channel.fullname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading avatar:', e);
                  e.target.src = '';
                  e.target.onerror = null;
                }}
              />
            ) : (
              <User className={subTextClass} size={40} />
            )}
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textClass}`}>
              {channel.fullname || channel.username}
            </h1>
            {channel.username && (
              <p className={`text-lg ${subTextClass}`}>
                @{channel.username}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <p className={subTextClass}>
                {videos.length} {videos.length === 1 ? 'video' : 'videos'}
              </p>
              {/* Add more stats here if needed */}
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="mx-4">
        <h2 className={`text-xl font-semibold mb-6 ${textClass}`}>Videos</h2>
        {videos.length === 0 ? (
          <div className={`text-center py-12 ${cardClass} rounded-lg`}>
            <p className={subTextClass}>No videos uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                theme={theme}
                onVideoClick={() => navigate(`/video/${video._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Channel; 