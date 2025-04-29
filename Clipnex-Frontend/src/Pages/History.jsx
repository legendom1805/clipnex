import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getWatchHistory, removeFromWatchHistory } from '../services/video.service';
import VideoCard from '../Components/VideoCard';
import { History as HistoryIcon, X } from 'lucide-react';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme, user } = useSelector(state => state.auth);
  // Get the actual user data from the nested structure
  const userData = user?.data;

  const fetchHistory = async () => {
    try {
      if (!userData) {
        setError('Please login to view watch history');
        setLoading(false);
        return;
      }

      const response = await getWatchHistory();
      console.log('Watch history response:', response);
      
      // The watch history is under response.data.data.watchHistory
      const watchHistory = response?.data?.watchHistory || [];
      console.log('Raw watch history:', watchHistory);
      
      // Map the history items to match the VideoCard expected format
      const formattedHistory = watchHistory.map(video => ({
        _id: video._id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        videoFile: video.videoFile,
        duration: video.duration,
        views: video.views,
        isPublished: video.isPublished,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        createdBy: {
          _id: video.owner._id,
          username: video.owner.username,
          fullname: video.owner.fullname,
          avatar: video.owner.avatar
        }
      }));
      
      console.log('Formatted history:', formattedHistory);
      setHistory(formattedHistory);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching watch history:', error);
      setError('Failed to load watch history');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userData]);

  const handleRemoveFromHistory = async (historyItem) => {
    try {
      const videoId = historyItem._id;
      await removeFromWatchHistory(videoId);
      setHistory(history.filter(item => item._id !== videoId));
    } catch (error) {
      console.error('Error removing video from history:', error);
    }
  };

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <HistoryIcon className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view watch history</h2>
        <p className="text-gray-500 text-center">
          Keep track of what you watch and get personalized recommendations
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <HistoryIcon className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2 text-red-500">{error}</h2>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <HistoryIcon className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">No watch history</h2>
        <p className="text-gray-500 text-center">
          Videos you watch will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pr-[15%]">
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {history.map((video) => (
          <div key={video._id} className="relative group">
            <VideoCard
              video={video}
              theme={theme}
            />
            <button
              onClick={() => handleRemoveFromHistory(video)}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              title="Remove from history"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
