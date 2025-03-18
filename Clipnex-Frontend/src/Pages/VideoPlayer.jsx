import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getVideoDetails, getUserDetails, updateVideoViews } from '../services/video.service';
import { getVideoComments, addVideoComment, deleteComment } from '../Database/comment_services';
import { toggleVideoLike, toggleCommentLike, getLikedVideos } from '../services/like.service';
import { User, ThumbsUp, Eye, Calendar, Clock, Send, Trash2, X, Heart } from 'lucide-react';
import { formatDuration } from '../utils/formatDuration';

function VideoPlayer() {
  const { videoId } = useParams();
  const authState = useSelector(state => state.auth);
  const { theme, user } = authState;
  // Get the actual user data from the nested structure
  const userData = user?.data;
  console.log('User data:', userData); // Log the actual user data

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isVideoLiked, setIsVideoLiked] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());
  const [commentLikes, setCommentLikes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoAndCreator = async () => {
      try {
        setLoading(true);
        // Fetch video details
        const videoResponse = await getVideoDetails(videoId);
        console.log('Video response:', videoResponse);

        if (!videoResponse || !videoResponse.data) {
          throw new Error('No video data received');
        }

        const videoData = videoResponse.data;
        console.log('Video data:', videoData);
        console.log('Creator data:', videoData.createdBy);
        setVideo(videoData);
        // Set initial like state
        setIsVideoLiked(videoData.isLiked || false);
        setError(null);
      } catch (err) {
        console.error('Error in fetchVideoAndCreator:', err);
        setError(err.message || 'Failed to load video');
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoAndCreator();
    }
  }, [videoId]);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!userData) return;
      try {
        const response = await getLikedVideos();
        console.log('Liked videos response:', response);
        
        // Handle both possible response structures
        const likedVideos = Array.isArray(response) ? response : 
                          Array.isArray(response.data) ? response.data : [];
        
        setIsVideoLiked(likedVideos.some(v => v._id === videoId));
      } catch (err) {
        console.error('Error fetching likes:', err);
        setIsVideoLiked(false);
      }
    };

    fetchLikes();
  }, [videoId, userData]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!userData) {
          console.log('No user found, skipping comment fetch'); // Debug log
          return;
        }
        console.log('Fetching comments for user:', userData._id); // Debug log
        const commentsData = await getVideoComments(videoId);
        console.log('Fetched comments:', commentsData);
        
        const commentsList = Array.isArray(commentsData) ? commentsData : 
                           Array.isArray(commentsData.data) ? commentsData.data : [];
        console.log('Processed comments:', commentsList);
        
        // Initialize comment likes
        const likesMap = {};
        commentsList.forEach(comment => {
          likesMap[comment._id] = comment.likes || 0;
        });
        setCommentLikes(likesMap);
        
        setComments(commentsList);
        setCommentError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setComments([]);
        setCommentError(null);
      }
    };

    if (videoId) {
      fetchComments();
    }
  }, [videoId, userData]);

  const handleAddComment = async () => {
    if (!comment.trim()) {
      setCommentError('Please enter a comment');
      return;
    }
    
    try {
      console.log('Submitting comment:', { videoId, content: comment });
      const newComment = await addVideoComment(videoId, comment);
      console.log('Comment response:', newComment);
      
      if (newComment) {
        const commentData = newComment.data || newComment;
        console.log('Adding new comment:', commentData); // Log the new comment data
        setComments(prev => [commentData, ...prev]);
        setComment('');
        setCommentError(null);
      } else {
        setCommentError('Failed to add comment - no response from server');
      }
    } catch (err) {
      console.error('Comment error:', err);
      setCommentError(err.response?.data?.message || err.message || 'Failed to add comment');
    }
  };

  // Add keyboard shortcut for commenting
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAddComment();
    }
  };

  const handleDeleteClick = (commentId) => {
    setDeleteConfirmation(commentId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await deleteComment(deleteConfirmation);
      setComments(prev => prev.filter(c => c._id !== deleteConfirmation));
      setCommentError(null);
      setDeleteConfirmation(null);
    } catch (err) {
      setCommentError(err.message || 'Failed to delete comment');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log('No date string provided');
      return 'Just now';
    }
    try {
      console.log('Formatting date:', dateString); // Log the date string we're trying to format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string received:', dateString);
        return 'Just now';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Just now';
    }
  };

  const handleVideoLike = async () => {
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const response = await toggleVideoLike(videoId);
      console.log('Video like response:', response);
      
      if (response && response.data) {
        // Update the video state with the new like count and status
        setVideo(prev => ({
          ...prev,
          likes: response.data.likes,
          isLiked: response.data.isLiked
        }));
        
        // Update the like state based on the response
        setIsVideoLiked(response.data.isLiked);
      }
    } catch (err) {
      console.error('Error toggling video like:', err);
      setError(err.response?.data?.message || 'Failed to like video');
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const response = await toggleCommentLike(commentId);
      console.log('Comment like response:', response);
      
      if (response && response.data) {
        // Update the comment's like status
        setLikedComments(prev => {
          const newSet = new Set(prev);
          if (response.data.isLiked) {
            newSet.add(commentId);
          } else {
            newSet.delete(commentId);
          }
          return newSet;
        });
        
        // Update comment likes count from the response
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: response.data.likes
        }));

        // Update comment in the list
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { 
                ...comment, 
                likes: response.data.likes,
                isLiked: response.data.isLiked
              }
            : comment
        ));
      }
    } catch (err) {
      console.error('Error toggling comment like:', err);
      setCommentError(err.response?.data?.message || 'Failed to like comment');
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
          <p className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Error loading video
          </p>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center pr-[15%]">
        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
          Video not found
        </p>
      </div>
    );
  }

  const containerClass = theme === 'dark' ? 'bg-darkbg' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' ? 'bg-fadetext/25' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${containerClass} pr-[15%] `}>
      <div className={`${cardClass} mx-4 mb-6 shadow-lg rounded-lg overflow-hidden`}>
        {/* Video Player Section */}
        <div className="w-full">
          <div className="mx-auto h-[calc(100vh-20rem)] overflow-hidden bg-black">
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
              poster={video.thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Video Information */}
        <div className="p-6">
          <h1 className={`text-2xl font-semibold mb-4 ${textClass}`}>
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className={subTextClass} size={24} />
              </div>
              <div>
                <p className={`font-medium ${textClass}`}>
                  {video.createdBy ? (
                    video.createdBy.username || video.createdBy.fullname || 'Anonymous'
                  ) : (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-5 w-24 inline-block">
                    </span>
                  )}
                </p>
                {video.createdBy?.username && (
                  <p className={`text-sm ${subTextClass}`}>
                    @{video.createdBy.username}
                  </p>
                )}
              </div>
            </div>

            {/* Video Stats */}
            <div className="flex flex-wrap items-center gap-6 ml-auto">
              <div className="flex items-center gap-2">
                <Eye className={subTextClass} size={20} />
                <span className={subTextClass}>{video.views || 0} views</span>
              </div>
              <button
                onClick={handleVideoLike}
                className={`flex items-center gap-2 ${isVideoLiked ? 'text-purple-500 hover:text-purple-600' : `${subTextClass} hover:text-purple-500`} transition-colors`}
              >
                <ThumbsUp className={isVideoLiked ? 'fill-current' : ''} size={20} />
                <span>{video.likes || 0} likes</span>
              </button>
              <div className="flex items-center gap-2">
                <Calendar className={subTextClass} size={20} />
                <span className={subTextClass}>{formatDate(video.createdAt)}</span>
              </div>
              {video.duration && (
                <div className="flex items-center gap-2">
                  <Clock className={subTextClass} size={20} />
                  <span className={subTextClass}>{formatDuration(video.duration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 ${borderClass} border`}>
            <h2 className={`font-medium mb-2 ${textClass}`}>Description</h2>
            <p className={`whitespace-pre-wrap ${subTextClass}`}>
              {video.description || 'No description available.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className={`${cardClass} mx-4 p-6 rounded-lg`}>
        <h2 className={`text-xl font-semibold mb-6 ${textClass}`}>Comments</h2>
        
        {!userData ? (
          <div className={`text-center py-8 ${borderClass} border rounded-lg`}>
            <p className={`${textClass} mb-4`}>Sign in to view and post comments</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Add Comment */}
            <div className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading avatar:', e);
                      e.target.src = ''; // Clear the src to show fallback
                    }}
                  />
                ) : (
                  <User className={subTextClass} size={20} />
                )}
              </div>
              <div className="flex-grow">
                <div className={`border ${borderClass} rounded-lg overflow-hidden focus-within:border-purple-500 transition-colors`}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add a comment... (Ctrl + Enter to submit)"
                    className={`w-full p-3 resize-none outline-none ${cardClass} ${textClass} placeholder-gray-500`}
                    rows="3"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  {commentError && (
                    <p className="text-red-500 text-sm">{commentError}</p>
                  )}
                  <button
                    className={`flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ml-auto ${!comment.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                  >
                    <Send size={16} />
                    Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className={`text-center py-8 ${borderClass} border rounded-lg`}>
                  <p className={`${subTextClass}`}>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {comment.owner?.avatar ? (
                        <img
                          src={comment.owner.avatar}
                          alt={comment.owner.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className={subTextClass} size={20} />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${textClass}`}>
                            {comment.owner?.fullname || comment.owner?.username || 'Anonymous'}
                          </p>
                          <span className={`text-sm ${subTextClass}`}>
                            • {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleCommentLike(comment._id)}
                            className={`flex items-center gap-1 ${likedComments.has(comment._id) ? 'text-purple-500 hover:text-purple-600' : `${subTextClass} hover:text-purple-500`} transition-colors`}
                          >
                            <Heart className={likedComments.has(comment._id) ? 'fill-current' : ''} size={16} />
                            <span className="text-sm">{commentLikes[comment._id] || 0}</span>
                          </button>
                          {userData._id === comment.owner?._id && (
                            <button
                              onClick={() => handleDeleteClick(comment._id)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={subTextClass}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardClass} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${textClass}`}>Delete Comment</h3>
              <button
                onClick={handleDeleteCancel}
                className={`${subTextClass} hover:text-gray-400 transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
            <p className={`${textClass} mb-6`}>
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleDeleteCancel}
                className={`px-4 py-2 rounded-lg border ${borderClass} ${textClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;