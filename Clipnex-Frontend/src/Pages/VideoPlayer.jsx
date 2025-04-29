import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getVideoDetails, getUserDetails, updateVideoViews } from '../services/video.service';
import { getVideoComments, addVideoComment, deleteComment } from '../Database/comment_services';
import { toggleVideoLike, toggleCommentLike, getLikedVideos, getVideoLikes } from '../services/like.service';
import { toggleSubscription, getChannelSubscribers } from '../services/subscription.service';
import { getUserPlaylists, addVideoToPlaylist } from '../services/playlist.service';
import { User, ThumbsUp, Eye, Calendar, Clock, Send, Trash2, X, Heart, Bell, Users, ListPlus, Plus, Check } from 'lucide-react';
import { formatDuration, formatRelativeTime } from '../utils/formatDuration';
import { fetchLikedVideos, toggleLike } from '../Store/likeSlice';
import { toast } from 'react-hot-toast';

function VideoPlayer() {
  const { videoId } = useParams();
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);
  const { theme, user } = authState;
  const likedVideos = useSelector(state => state.likes.likedVideos);
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
  const [subscribing, setSubscribing] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [playlistError, setPlaylistError] = useState(null);
  const [totalLikes, setTotalLikes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoAndCreator = async () => {
      try {
        setLoading(true);
        // Fetch video details
        const videoResponse = await getVideoDetails(videoId);
        console.log('Raw video response:', videoResponse);
        console.log('Video creator data:', videoResponse?.data?.createdBy);

        if (!videoResponse || !videoResponse.data) {
          throw new Error('No video data received');
        }

        const videoData = videoResponse.data;
        console.log('Processed video data:', videoData);
        console.log('Creator data:', videoData.createdBy);

        // Ensure createdBy data is properly structured
        if (!videoData.createdBy || !videoData.createdBy._id) {
          console.error('Missing creator data:', videoData);
          
          // Try to fetch creator data separately if we have a userId
          if (videoData.userId) {
            try {
              const creatorResponse = await getUserDetails(videoData.userId);
              if (creatorResponse && creatorResponse.data) {
                videoData.createdBy = {
                  _id: creatorResponse.data._id,
                  username: creatorResponse.data.username,
                  fullname: creatorResponse.data.fullname || creatorResponse.data.username,
                  avatar: creatorResponse.data.avatar || "",
                  isSubscribed: false,
                  subscribersCount: 0
                };
              } else {
                throw new Error('Video creator information is missing');
              }
            } catch (creatorErr) {
              console.error('Error fetching creator details:', creatorErr);
              throw new Error('Video creator information is missing');
            }
          } else {
            throw new Error('Video creator information is missing');
          }
        }

        // Set video data first
        setVideo(videoData);
        
        // Set initial total likes from video data
        setTotalLikes(videoData.likes || 0);
        
        // If user is logged in, check subscription status and likes
        if (userData && videoData.createdBy?._id) {
          try {
            // Check subscription status
            const subscribersResponse = await getChannelSubscribers(videoData.createdBy._id);
            console.log('Subscribers response:', subscribersResponse);
            
            if (subscribersResponse && subscribersResponse.data) {
              const isUserSubscribed = subscribersResponse.data.subscribers?.some(
                sub => sub._id === userData._id
              ) || false;
              
              // Update video with subscription status
              setVideo(prev => ({
                ...prev,
                createdBy: {
                  ...prev.createdBy,
                  isSubscribed: isUserSubscribed,
                  subscribersCount: subscribersResponse.data.totalSubscribers || 0
                }
              }));
            }
          } catch (subErr) {
            console.error('Error fetching subscription status:', subErr);
            // Set default values if we can't fetch subscription status
            setVideo(prev => ({
              ...prev,
              createdBy: {
                ...prev.createdBy,
                isSubscribed: false,
                subscribersCount: 0
              }
            }));
          }

          // Fetch liked videos from Redux store
          await dispatch(fetchLikedVideos());
        }

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
  }, [videoId, userData, dispatch]);

  // Update isVideoLiked when likedVideos changes
  useEffect(() => {
    const initializeLikeState = async () => {
      if (userData && videoId) {
        try {
          // Fetch liked videos and update like state
          await dispatch(fetchLikedVideos());
          const isLiked = likedVideos.includes(videoId);
          setIsVideoLiked(isLiked);
          
          // Fetch and update likes count
          const likesCount = await getVideoLikes(videoId);
          setTotalLikes(likesCount);
          setVideo(prev => ({
            ...prev,
            likes: likesCount
          }));
        } catch (err) {
          console.error('Error initializing like state:', err);
        }
      }
    };

    initializeLikeState();
  }, [videoId, userData]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!userData) {
          console.log('No user found, skipping comment fetch');
          return;
        }
        console.log('Fetching comments for user:', userData._id);
        const commentsData = await getVideoComments(videoId);
        console.log('Fetched comments:', commentsData);
        
        // Handle empty comments array
        if (!commentsData || commentsData.length === 0) {
          setComments([]);
          setCommentLikes({});
          setCommentError(null);
          return;
        }
        
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
        // If the error is "No comments", treat it as an empty list
        if (err.response?.data?.includes('No comments') || err.response?.status === 400) {
          setComments([]);
          setCommentLikes({});
          setCommentError(null);
        } else {
          setComments([]);
          setCommentError('Failed to load comments');
        }
      }
    };

    if (videoId) {
      fetchComments();
    }
  }, [videoId, userData]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!userData?._id || !showPlaylistModal) {
        console.log('Skipping playlist fetch - no user or modal not shown');
        return;
      }
      
      try {
        setLoadingPlaylists(true);
        console.log('Fetching playlists for user:', userData._id);
        const response = await getUserPlaylists(userData._id);
        console.log('Playlists response:', response);
        setPlaylists(response.data);
        setPlaylistError(null);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setPlaylistError(err.message || 'Failed to load playlists');
      } finally {
        setLoadingPlaylists(false);
      }
    };

    fetchPlaylists();
  }, [userData, showPlaylistModal]);

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

  const handleVideoLike = async () => {
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      // Update the backend and Redux store
      const response = await dispatch(toggleLike(videoId)).unwrap();
      console.log('Video like response:', response);
      
      // Update the like state based on the response
      setIsVideoLiked(response.isLiked);
      
      // Fetch updated likes count from the backend
      const updatedLikesCount = await getVideoLikes(videoId);
      setTotalLikes(updatedLikesCount);
      setVideo(prev => ({
        ...prev,
        likes: updatedLikesCount
      }));
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

  const handleSubscribe = async () => {
    if (!userData) {
      navigate('/login');
      return;
    }

    console.log('Video data:', video);
    console.log('Channel data:', video?.createdBy);

    if (!video?.createdBy?._id) {
      console.error('No channel ID found. Video data:', video);
      toast.error('Unable to subscribe: Channel information not found');
      return;
    }

    try {
      setSubscribing(true);
      const response = await toggleSubscription(video.createdBy._id);
      console.log('Subscription response:', response);
      
      // Update video state with new subscription status
      setVideo(prev => ({
        ...prev,
        createdBy: {
          ...prev.createdBy,
          isSubscribed: !prev.createdBy.isSubscribed,
          subscribersCount: prev.createdBy.isSubscribed 
            ? (prev.createdBy.subscribersCount || 1) - 1 
            : (prev.createdBy.subscribersCount || 0) + 1
        }
      }));

      // Fetch updated subscribers list to ensure accuracy
      const subscribersResponse = await getChannelSubscribers(video.createdBy._id);
      if (subscribersResponse && subscribersResponse.data) {
        setVideo(prev => ({
          ...prev,
          createdBy: {
            ...prev.createdBy,
            subscribersCount: subscribersResponse.data.totalSubscribers || 0
          }
        }));
      }

    } catch (err) {
      console.error('Error toggling subscription:', err);
      toast.error(err.response?.data?.message || 'Failed to update subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!userData) {
      console.log('No user data, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      setAddingToPlaylist(playlistId);
      console.log('Adding video to playlist:', { playlistId, videoId });
      await addVideoToPlaylist(playlistId, videoId);
      
      // Update the playlists state to reflect the addition
      setPlaylists(prev => prev.map(playlist => {
        if (playlist._id === playlistId) {
          return {
            ...playlist,
            videos: [...(playlist.videos || []), video._id]
          };
        }
        return playlist;
      }));
      
      setPlaylistError(null);
    } catch (err) {
      console.error('Error adding to playlist:', err);
      setPlaylistError(err.message || 'Failed to add video to playlist');
    } finally {
      setAddingToPlaylist(null);
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
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/c/${video.createdBy.username}`)}
                >
                  {video.createdBy.avatar ? (
                    <img
                      src={video.createdBy.avatar}
                      alt={video.createdBy.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} size={24} />
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <h3 
                  className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} cursor-pointer hover:text-purple-500`}
                  onClick={() => navigate(`/c/${video.createdBy.username}`)}
                >
                  {video.createdBy.fullname || video.createdBy.username}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {video.createdBy.subscribersCount || 0} subscribers
                </p>
              </div>
              {userData && userData._id !== video.createdBy._id && (
                <button 
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`${
                    video.createdBy.isSubscribed 
                      ? 'bg-gray-600 hover:bg-gray-700' 
                      : 'bg-purple-500 hover:bg-purple-600'
                  } text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50`}
                >
                  {subscribing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {video.createdBy.isSubscribed ? <Bell size={20} /> : <Users size={20} />}
                      {video.createdBy.isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </>
                  )}
                </button>
              )}
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
                <ThumbsUp className={isVideoLiked ? 'fill-current text-purple-500' : ''} size={20} />
                <span className={isVideoLiked ? 'text-purple-500' : ''}>{totalLikes} likes</span>
              </button>
              {userData && (
                <button
                  onClick={() => setShowPlaylistModal(true)}
                  className={`flex items-center gap-2 ${subTextClass} hover:text-purple-500 transition-colors`}
                >
                  <ListPlus size={20} />
                  <span>Save</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <Calendar className={subTextClass} size={20} />
                <span className={subTextClass}>{formatRelativeTime(video.createdAt)}</span>
              </div>
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
                            • {formatRelativeTime(comment.createdAt)}
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
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

      {/* Add the Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className={`${cardClass} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${textClass}`}>Save to...</h3>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className={`${subTextClass} hover:text-gray-400 transition-colors`}
              >
                <X size={20} />
              </button>
            </div>

            {playlistError && (
              <p className="text-red-500 mb-4">{playlistError}</p>
            )}

            {loadingPlaylists ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-4">
                <p className={`${subTextClass} mb-4`}>No playlists found</p>
                <button
                  onClick={() => {
                    setShowPlaylistModal(false);
                    navigate('/playlists');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors mx-auto"
                >
                  <Plus size={20} />
                  Create New Playlist
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {playlists.map((playlist) => {
                  const isInPlaylist = playlist.videos?.includes(video._id);
                  return (
                    <button
                      key={playlist._id}
                      onClick={() => !isInPlaylist && handleAddToPlaylist(playlist._id)}
                      disabled={addingToPlaylist === playlist._id || isInPlaylist}
                      className={`w-full flex items-center justify-between p-3 rounded-lg ${
                        isInPlaylist
                          ? 'bg-purple-500 text-white'
                          : `${cardClass} hover:bg-purple-500 hover:text-white`
                      } transition-colors ${addingToPlaylist === playlist._id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <ListPlus size={20} />
                        <span className="font-medium">{playlist.name}</span>
                      </div>
                      {addingToPlaylist === playlist._id ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isInPlaylist ? (
                        <Check size={20} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowPlaylistModal(false);
                  navigate('/playlists');
                }}
                className="flex items-center gap-2 px-4 py-2 text-purple-500 hover:text-purple-600 transition-colors"
              >
                <Plus size={20} />
                Create New Playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;