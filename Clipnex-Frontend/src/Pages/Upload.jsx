import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileVideo, Image, Type, Send } from 'lucide-react';
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

  const containerClass = theme === "dark" ? "bg-darkbg" : "bg-white";
  const textClass = theme === "dark" ? "text-white" : "text-gray-900";
  const subTextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const cardClass = theme === "dark" ? "bg-fadetext/25" : "bg-white";
  const borderClass = theme === "dark" ? "border-gray-700" : "border-gray-200";
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
    <div className={`min-h-screen ${containerClass} py-8 px-4 md:px-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <UploadIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
          <h1 className={`text-2xl font-bold ${textClass}`}>Upload Video</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div className={`${cardClass} rounded-lg p-6 shadow-lg ${borderClass} border`}>
            <div className="flex items-center gap-3 mb-4">
              <FileVideo className={`w-6 h-6 ${subTextClass}`} />
              <h2 className={`text-xl font-semibold ${textClass}`}>Video File</h2>
            </div>
            <div className={`border-2 border-dashed rounded-lg p-6 ${theme === 'dark' ? 'border-white/50' : 'border-gray-300'}`}>
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
                  <div className="space-y-4 w-full">
                    <video src={videoPreview} className="w-full max-h-64 rounded-lg" controls />
                    {videoDuration && (
                      <p className={`text-sm ${subTextClass}`}>
                        Duration: {videoDuration}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadIcon className={`w-12 h-12 mb-3 ${subTextClass}`} />
                    <p className={subTextClass}>Click to upload video</p>
                    <p className={`text-xs mt-2 ${subTextClass}`}>MP4, WebM, or MOV (max 500MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className={`${cardClass} rounded-lg p-6 shadow-lg ${borderClass} border`}>
            <div className="flex items-center gap-3 mb-4">
              <Image className={`w-6 h-6 ${subTextClass}`} />
              <h2 className={`text-xl font-semibold ${textClass}`}>Thumbnail</h2>
            </div>
            <div className={`border-2 border-dashed rounded-lg p-6 ${theme === 'dark' ? 'border-white/50' : 'border-gray-300'}`}>
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
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="max-h-64 rounded-lg" />
                ) : (
                  <div className="text-center">
                    <UploadIcon className={`w-12 h-12 mb-3 ${subTextClass}`} />
                    <p className={subTextClass}>Click to upload thumbnail</p>
                    <p className={`text-xs mt-2 ${subTextClass}`}>PNG, JPG, or JPEG (max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title and Description */}
          <div className={`${cardClass} rounded-lg p-6 shadow-lg ${borderClass} border`}>
            <div className="flex items-center gap-3 mb-4">
              <Type className={`w-6 h-6 ${subTextClass}`} />
              <h2 className={`text-xl font-semibold ${textClass}`}>Video Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 ${textClass}`}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg outline-none ${inputClass}`}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className={`block mb-2 ${textClass}`}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg outline-none ${inputClass} min-h-[120px] resize-y`}
                  placeholder="Enter video description"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Upload; 