import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserDetails } from '../services/user.service';
import { getChannelVideos } from '../services/video.service';
import { toggleSubscription, getChannelSubscribers } from '../services/subscription.service';
import { User, Users, Video, Calendar, Bell } from 'lucide-react';
import VideoCard from '../Components/VideoCard';

function Channel() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { theme, user: currentUser } = useSelector(state => state.auth);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribers, setSubscribers] = useState({ list: [], total: 0 });

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        console.log('Fetching channel data for username:', username);
        
        // Fetch channel details
        const channelResponse = await getUserDetails(username);
        console.log('Channel details:', channelResponse);
        
        if (!channelResponse || !channelResponse.data) {
          throw new Error('Channel not found');
        }
        setChannel(channelResponse.data);

        // Fetch channel videos
        const videosResponse = await getChannelVideos(username);
        console.log('Channel videos:', videosResponse);
        
        if (videosResponse && videosResponse.data) {
          setVideos(videosResponse.data);
        } else {
          setVideos([]);
        }

        // Fetch channel subscribers
        if (channelResponse.data._id) {
          const subscribersResponse = await getChannelSubscribers(channelResponse.data._id);
          console.log('Channel subscribers:', subscribersResponse);
          if (subscribersResponse && subscribersResponse.data) {
            setSubscribers({
              list: subscribersResponse.data.subscribers || [],
              total: subscribersResponse.data.totalSubscribers || 0
            });
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching channel data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load channel');
        setChannel(null);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchChannelData();
    }
  }, [username]);

  const handleSubscribe = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setSubscribing(true);
      const response = await toggleSubscription(channel._id);
      console.log('Subscription response:', response);
      
      // Update local channel state with new subscription status
      setChannel(prev => ({
        ...prev,
        isSubscribed: !prev.isSubscribed
      }));

      // Update subscribers count
      setSubscribers(prev => ({
        ...prev,
        total: prev.total + (response.data.message.includes('Subscribed') ? 1 : -1)
      }));

      // Fetch updated subscribers list
      const subscribersResponse = await getChannelSubscribers(channel._id);
      if (subscribersResponse && subscribersResponse.data) {
        setSubscribers({
          list: subscribersResponse.data.subscribers || [],
          total: subscribersResponse.data.totalSubscribers || 0
        });
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
      setError('Failed to update subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const containerClass = theme === 'dark' ? 'bg-darkbg' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' ? 'bg-fadetext/25' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const buttonClass = theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600';

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
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50">
          <img
            src={channel.coverImage}
            alt="Channel Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading cover image:', e);
              e.target.src = '';
              e.target.onerror = null;
            }}
          />
        </div>
      </div>

      {/* Channel Info Section */}
      <div className={`relative ${cardClass} mx-4 -mt-16 rounded-lg shadow-xl p-6`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full ring-4 ring-purple-500 bg-gray-200 flex items-center justify-center overflow-hidden">
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
              <User className={subTextClass} size={48} />
            )}
          </div>

          {/* Channel Details */}
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${textClass} mb-2`}>
                  {channel.fullname || channel.username}
                </h1>
                {channel.username && (
                  <p className={`text-lg ${subTextClass} mb-4`}>
                    @{channel.username}
                  </p>
                )}
              </div>

              {currentUser && currentUser.username !== channel.username && (
                <button 
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`${
                    channel.isSubscribed 
                      ? 'bg-gray-600 hover:bg-gray-700' 
                      : buttonClass
                  } text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {subscribing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {channel.isSubscribed ? <Bell size={20} /> : <Users size={20} />}
                      {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className={`${cardClass} p-4 rounded-lg border ${borderClass}`}>
                <div className="flex items-center gap-2">
                  <Users className={`${subTextClass}`} size={20} />
                  <span className={`${textClass} font-semibold`}>{subscribers.total}</span>
                </div>
                <p className={`${subTextClass} text-sm mt-1`}>Subscribers</p>
              </div>
              
              <div className={`${cardClass} p-4 rounded-lg border ${borderClass}`}>
                <div className="flex items-center gap-2">
                  <Video className={`${subTextClass}`} size={20} />
                  <span className={`${textClass} font-semibold`}>{videos.length}</span>
                </div>
                <p className={`${subTextClass} text-sm mt-1`}>Videos</p>
              </div>

              <div className={`${cardClass} p-4 rounded-lg border ${borderClass}`}>
                <div className="flex items-center gap-2">
                  <Users className={`${subTextClass}`} size={20} />
                  <span className={`${textClass} font-semibold`}>{channel.channelsSubscribedToCount}</span>
                </div>
                <p className={`${subTextClass} text-sm mt-1`}>Subscribed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="mx-4 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${textClass}`}>Videos</h2>
          <div className="flex items-center gap-2">
            <Calendar className={subTextClass} size={20} />
            <span className={subTextClass}>Latest</span>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className={`text-center py-16 ${cardClass} rounded-lg border ${borderClass}`}>
            <Video className={`mx-auto ${subTextClass} mb-4`} size={48} />
            <p className={`${textClass} text-lg font-semibold mb-2`}>No videos yet</p>
            <p className={subTextClass}>This channel hasn't uploaded any videos</p>
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