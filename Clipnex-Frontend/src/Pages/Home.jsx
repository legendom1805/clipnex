import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideos as fetchVideosAction } from '../Store/videoSlice';
import VideoCard from "../Components/VideoCard";
import { AlertCircle } from 'lucide-react';
import { formatDuration } from '../utils/formatDuration';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, LogIn } from 'lucide-react';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { videos, loading, error } = useSelector(state => state.videos);
  const { user, theme } = useSelector(state => state.auth);
  const [localVideos, setLocalVideos] = useState([]);

  useEffect(() => {
    dispatch(fetchVideosAction());
  }, [dispatch]);

  useEffect(() => {
    if (videos) {
      setLocalVideos(videos);
    }
  }, [videos]);

  const handleRetry = () => {
    dispatch(fetchVideosAction());
  };

  const handleVideoClick = (videoId) => {
    setLocalVideos(prevVideos => 
      prevVideos.map(video => 
        video._id === videoId 
          ? { ...video, views: (video.views || 0) + 1 }
          : video
      )
    );
  };

  const handleUpload = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/upload');
  };

  if (loading && (!videos || videos.length === 0)) {
    return (
      <div className="h-[calc(100vh-4rem)] pr-[15%] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error && (!videos || videos.length === 0)) {
    return (
      <div className="h-[calc(100vh-4rem)] pr-[15%] flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg font-semibold mb-2">Error loading videos</p>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            {error === 'Cannot connect to server. Please check if the backend server is running.'
              ? 'Unable to connect to the server. Please make sure the backend server is running.'
              : error}
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-8 pb-8 px-4 pr-[calc(15%+1rem)] overflow-y-auto">
      <div className="max-w-[2000px] mx-auto">
        {!localVideos || localVideos.length === 0 ? (
          <div className="text-center">
            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              No videos available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max">
            {localVideos.map(video => (
              <VideoCard 
                key={video._id} 
                video={video} 
                theme={theme}
                onVideoClick={handleVideoClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
