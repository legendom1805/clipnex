const conf = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  uploadBaseUrl: import.meta.env.VITE_UPLOAD_BASE_URL,
  defaultPageSize: 12, // Default number of items per page
  maxUploadSize: 100 * 1024 * 1024, // 100MB max upload size
  supportedVideoFormats: [
    // Supported video format
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
  supportedImageFormats: [
    // Supported image formats for thumbnails
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
};

// Log configuration for debugging
console.log("Environment Variables:", {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_UPLOAD_BASE_URL: import.meta.env.VITE_UPLOAD_BASE_URL,
});

// Validate configuratio
if (!conf.apiBaseUrl) {
  console.error("API Base URL is not configured. Please check your .env file.");
}

export default conf;
