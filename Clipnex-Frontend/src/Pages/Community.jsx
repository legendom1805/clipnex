import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAllPosts } from '../services/post.service';
import { MessageSquare, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme, user } = useSelector(state => state.auth);
  const userData = user?.data;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!userData) {
          setError('Please login to view posts');
          setLoading(false);
          return;
        }

        const response = await getAllPosts();
        console.log('Posts response:', response);
        setPosts(response.data.data.posts || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userData]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      await api.delete(`/posts/delete-post/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please sign in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <MessageSquare className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view community posts</h2>
        <p className="text-gray-500 text-center">
          Join the conversation and share your thoughts
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
        <MessageSquare className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2 text-red-500">{error}</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center ">
      <div className="w-full max-w-2xl">
        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={post.owner.avatar}
                  alt={post.owner.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {post.owner.fullname}
                      </h3>
                      <span className="text-gray-500 dark:text-gray-400">
                        @{post.owner.username}
                      </span>
                    </div>
                    {post.owner._id === userData._id && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-500 hover:text-red-600 transition-colors p-1"
                        title="Delete post"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-gray-800 dark:text-gray-200">
                    {post.content}
                  </p>
                  {post.image && (
                    <div className="mt-3">
                      <img
                        src={post.image}
                        alt="Post image"
                        className="max-w-full rounded-lg"
                        onError={(e) => {
                          console.error('Error loading post image:', e);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Community; 