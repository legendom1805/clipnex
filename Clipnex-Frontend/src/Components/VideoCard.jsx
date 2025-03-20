import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PlayCircle, User } from 'lucide-react';
import { updateVideoViews } from '../services/video.service';
import { formatDuration, formatRelativeTime } from '../utils/formatDuration';

function VideoCard({ video, theme, onVideoClick }) {
  const navigate = useNavigate();
  const { theme: globalTheme } = useSelector(state => state.auth);

  const cardClass = theme === 'dark'
    ? 'bg-fadetext/25 hover:bg-gray-700'
    : 'bg-white hover:bg-gray-50';

  const textClass = theme === 'dark'
    ? 'text-white'
    : 'text-gray-900';

  const subTextClass = theme === 'dark'
    ? 'text-gray-300'
    : 'text-gray-600';

  const formatVideoDuration = (duration) => {
    if (!duration) return '0:00';
    
    // Round to nearest second to handle decimal durations
    const totalSeconds = Math.round(duration);
    
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Format with leading zeros for seconds
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClick = async () => {
    try {
      // Update views in the backend
      await updateVideoViews(video._id);
      
      // Update local view count immediately
      if (onVideoClick) {
        onVideoClick(video._id);
      }
      
      // Navigate to video page
      navigate(`/video/${video._id}`);
    } catch (error) {
      console.error('Error updating video views:', error);
      // Still navigate even if view update fails
      navigate(`/video/${video._id}`);
    }
  };

  return (
    <div 
      className={`rounded-lg overflow-hidden shadow-md transition-all duration-200 cursor-pointer ${cardClass}`}
      onClick={handleClick}
    >
      <div className="relative aspect-video">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {video.createdBy?.avatar ? (
              <img 
                src={video.createdBy.avatar} 
                alt={video.createdBy.fullname || video.createdBy.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className={subTextClass} size={20} />
              </div>
            )}
          </div>
          
          <div className="flex-grow min-w-0">
            <h3 className={`font-medium text-base mb-1 line-clamp-2 ${textClass}`}>
              {video.title}
            </h3>
            <p className={`text-sm ${subTextClass}`}>
              {video.createdBy?.fullname || video.createdBy?.username || 'Unknown Creator'}
            </p>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className={subTextClass}>
                {video.views || 0} views
              </span>
              {video.createdAt && (
                <>
                  <span className={subTextClass}>•</span>
                  <span className={subTextClass}>
                    {formatRelativeTime(video.createdAt)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
