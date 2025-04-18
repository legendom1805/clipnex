import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { apiError } from "./apiError.js";
import { apiResponse } from "./apiResponse.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) {
      console.error("Local file path not found!");
      return null;
    }

    // Check if file exists
    if (!fs.existsSync(localfilepath)) {
      console.error(`File not found at path: ${localfilepath}`);
      return null;
    }

    // Get file size
    const stats = fs.statSync(localfilepath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`File size: ${fileSizeInMB.toFixed(2)} MB`);

    // Check file size (100MB limit for videos, 10MB for images)
    const isVideo = localfilepath.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i);
    const maxSize = isVideo ? 500 : 10; // MB
    
    if (fileSizeInMB > maxSize) {
      console.error(`File size ${fileSizeInMB.toFixed(2)}MB exceeds limit of ${maxSize}MB`);
      return null;
    }

    // Upload to Cloudinary with chunking for large files
    console.log(`Attempting to upload file: ${localfilepath}`);
    const uploadOptions = {
      resource_type: "auto",
      timeout: 120000, // 2 minutes timeout
      chunk_size: 6000000, // 6MB chunks
    };

    // Add specific options for videos
    if (isVideo) {
      Object.assign(uploadOptions, {
        eager: [
          { width: 300, height: 300, crop: "pad", audio_codec: "none" },
          { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" }
        ],
        eager_async: true,
        eager_notification_url: "https://your-domain.com/notify-upload"
      });
    }

    const response = await cloudinary.uploader.upload(localfilepath, uploadOptions);

    // File has been uploaded successfully
    console.log("File uploaded successfully to Cloudinary:", {
      url: response.url,
      public_id: response.public_id,
      resource_type: response.resource_type,
      bytes: response.bytes,
      format: response.format
    });

    // Clean up local file
    try {
      fs.unlinkSync(localfilepath);
      console.log(`Local file cleaned up: ${localfilepath}`);
    } catch (cleanupError) {
      console.warn("Warning: Failed to cleanup local file:", cleanupError);
    }

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", {
      error: error.message,
      filepath: localfilepath
    });

    // Clean up local file on error
    try {
      if (fs.existsSync(localfilepath)) {
        fs.unlinkSync(localfilepath);
        console.log(`Cleaned up local file after error: ${localfilepath}`);
      }
    } catch (cleanupError) {
      console.warn("Warning: Failed to cleanup local file after error:", cleanupError);
    }

    return null;
  }
};

const deleteFromCloudinary = async (file, resource_type="video") => {
  
  const filename = file.split("/").pop().split(".")[0];

  const deletefile = await cloudinary.uploader.destroy(filename, {
    resource_type: resource_type,
  });

  if (!deletefile) {
    throw new apiError(500, "Failed to delete file");
  }

  return deletefile
};

export { uploadOnCloudinary, deleteFromCloudinary };
