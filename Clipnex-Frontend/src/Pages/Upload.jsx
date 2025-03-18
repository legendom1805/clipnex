import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { uploadVideo } from '../services/video.service';
import { toast } from 'react-hot-toast';
import { formatDuration } from '../utils/formatDuration';

function Upload() {
  const navigate = useNavigate();
  const { theme, accessToken } = useSelector(state => state.auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [videoDuration, setVideoDuration] = useState('');

  const inputClass = theme === 'dark'
    ? 'bg-[#D9D9D9]/25 border-white/50 text-white placeholder-gray-400'
    : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500';

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create video element to get duration
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = formatDuration(video.duration);
        setVideoDuration(duration);
      };

      video.src = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !description || !videoFile || !thumbnail) {
      setError('Please fill all the required fields');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnail);

    try {
      const response = await uploadVideo(formData, accessToken);
      
      // Show success message
      toast.success('Video published successfully!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px'
        }
      });
      
      // Navigate to home page after successful upload
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      toast.error(error?.message || 'Failed to upload video', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Upload Video
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <div className="space-y-2">
          <label className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
            Video File *
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 ${theme === 'dark' ? 'border-white/50' : 'border-gray-300'}`}>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              {videoPreview ? (
                <div className="space-y-2">
                  <video src={videoPreview} className="max-h-48 mb-2" controls />
                  {videoDuration && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-500'}`}>
                      Duration: {videoDuration}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <UploadIcon className={`w-12 h-12 mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-gray-400'}`} />
                  <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-500'}>
                    Click to upload video
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-2">
          <label className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
            Thumbnail *
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 ${theme === 'dark' ? 'border-white/50' : 'border-gray-300'}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              id="thumbnail-upload"
            />
            <label
              htmlFor="thumbnail-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="max-h-48 mb-2" />
              ) : (
                <>
                  <UploadIcon className={`w-12 h-12 mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-gray-400'}`} />
                  <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-500'}>
                    Click to upload thumbnail
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg outline-none ${inputClass}`}
            placeholder="Enter video title"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg outline-none min-h-[100px] ${inputClass}`}
            placeholder="Enter video description"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : theme === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}

export default Upload; 