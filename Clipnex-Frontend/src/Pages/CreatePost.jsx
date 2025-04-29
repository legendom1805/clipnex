import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../Components/Button';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, theme } = useSelector((state) => state.auth);
  const userData = user?.data;
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userData) {
      toast.error('Please sign in to create a post');
      navigate('/login');
      return;
    }
  }, [userData, navigate]);

  const textareaClass = theme === 'dark'
    ? 'bg-darkbg border-white/20 text-white placeholder-gray-400'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) {
      toast.error('Please sign in to create a post');
      navigate('/login');
      return;
    }

    if (!content.trim() && !image) {
      toast.error('Please add some content or an image to your post');
      return;
    }

    setIsLoading(true);
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please sign in to create a post');
        navigate('/login');
        return;
      }

      const response = await api.post('/posts/create-post', 
        { content: content.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (response.data.success) {
        toast.success('Post created successfully!');
        navigate('/community');
      } else {
        throw new Error(response.data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please sign in again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create post');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return null; // Don't render anything if user is not logged in
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`min-h-[200px] w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${textareaClass}`}
        />
        
        {/* <div className="space-y-2">
          <label className="block text-sm font-medium">
            Add Image (optional)
          </label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('imageInput').click()}
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div> 
        </div>*/}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/community')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 