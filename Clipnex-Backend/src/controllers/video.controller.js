import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";



const uploadVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new apiError(401, "Both title and description are required!");
    }

    // Log the incoming files
    console.log("Incoming files:", {
      videoFile: req.files?.videoFile?.[0]?.size,
      thumbnail: req.files?.thumbnail?.[0]?.size
    });

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
      throw new apiError(400, "Both video and thumbnail files are required!");
    }

    // Check file sizes
    const videoSize = req.files?.videoFile?.[0]?.size / (1024 * 1024); // Convert to MB
    const thumbnailSize = req.files?.thumbnail?.[0]?.size / (1024 * 1024); // Convert to MB

    if (videoSize > 100) {
      throw new apiError(413, `Video file size (${videoSize.toFixed(2)}MB) exceeds the limit of 100MB`);
    }

    if (thumbnailSize > 10) {
      throw new apiError(413, `Thumbnail file size (${thumbnailSize.toFixed(2)}MB) exceeds the limit of 10MB`);
    }

    console.log("Uploading video file to Cloudinary...");
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    if (!videoFile) {
      throw new apiError(500, "Failed to upload video file. Please ensure the file is a valid video format and within size limits (max 100MB).");
    }

    console.log("Uploading thumbnail to Cloudinary...");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
      // Cleanup video if thumbnail upload fails
      if (videoFile.public_id) {
        console.log("Cleaning up video due to thumbnail upload failure...");
        await deleteFromCloudinary(videoFile.public_id, "video").catch(err => {
          console.error("Failed to cleanup video after thumbnail upload failure:", err);
        });
      }
      throw new apiError(500, "Failed to upload thumbnail. Please ensure the file is a valid image format and within size limits (max 10MB).");
    }

    console.log("Creating video document in database...");
    const video = await Video.create({
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      title,
      description,
      owner: req.user?._id,
      duration: videoFile.duration || 0,
    });

    return res
      .status(201)
      .json(new apiResponse(201, video, "Video uploaded successfully!"));
  } catch (error) {
    // Log the full error for debugging
    console.error("Error in uploadVideo:", error);
    
    // If it's already an apiError, throw it as is
    if (error instanceof apiError) {
      throw error;
    }
    
    // Otherwise, wrap it in an apiError
    throw new apiError(500, `Error uploading video: ${error.message}`);
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video ID");
  }
  if (!videoId) {
    throw new apiError(400, "Video Id is required");
  }

  const video = await Video.findById(videoId);

  if (!(video?.owner).equals(req.user?._id)) {
    throw new apiError(400, "You cannot delete this video");
  }

  const videoPublicId = video.videoFile;
  const imagePublicId = video.thumbnail;

  if (!(videoPublicId || imagePublicId)) {
    throw new apiError(400, "Video and thumbnail is required!");
  }

  await deleteFromCloudinary(videoPublicId, "video");
  await deleteFromCloudinary(imagePublicId, "image");

  const videoDeleted = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new apiResponse(200, videoDeleted, "Video deleted successfully!"));
});

const getVideobyId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video ID");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    {
      $unwind: "$createdBy"
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        createdBy: {
          avatar: 1,
          fullname: 1,
          username: 1
        }
      }
    }
  ]);

  if (!video || video.length === 0) {
    throw new apiError(404, "No video found");
  }

  return res.status(200).json(new apiResponse(200, video[0], "Video Fetched"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);
  if (!video || !video.owner.equals(req.user?._id)) {
    throw new apiError(403, "Unauthorized to update this video");
  }

  const updates = {};
  if (title) updates.title = title;
  if (description) updates.description = description;

  if (req.file?.path) {
    const deleteThumbnailResponse = await deleteFromCloudinary(
      video.thumbnail,
      "image"
    );

    if (deleteThumbnailResponse.result !== "ok") {
      throw new apiError(500, "Error while deleting old thumbnail");
    }
    const thumbnailLocalPath = req.file?.path;

    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!newThumbnail?.url) {
      throw new apiError(500, "Error while uploading new thumbnail");
    }

    updates.thumbnail = newThumbnail.url;
  }

  if (Object.keys(updates).length > 0) {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $set: updates },
      { new: true }
    );
    if (!updatedVideo) {
      throw new apiError(500, "Video details update failed!");
    }
    return res
      .status(200)
      .json(new apiResponse(200, updatedVideo, "Video updated successfully!"));
  }

  throw new apiError(400, "No updates provided");
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "No video found");
  }

  if (!(video?.owner).equals(req.user?._id)) {
    throw new apiError(400, "You cannot delete this video");
  }

  const modifyPublishStatus = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { modifyPublishStatus },
        "Video Publish status modified"
      )
    );
});

const getAllvideos = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      query = "",
      sortBy = "createdAt",
      sortType = "desc",
      userId,
    } = req.query;

    console.log('Getting videos with params:', {
      page, limit, query, sortBy, sortType, userId
    });

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Basic validation
    if (isNaN(pageNum) || pageNum < 1) {
      throw new apiError(400, "Invalid page number");
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw new apiError(400, "Invalid limit number");
    }

    // Build match condition
    const matchCondition = {
      isPublished: true, // Only fetch published videos
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ]
    };

    // Add userId filter if provided
    if (userId) {
      matchCondition.owner = new mongoose.Types.ObjectId(userId);
    }

    const videos = await Video.aggregate([
      {
        $match: matchCondition
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: "$createdBy",
      },
      {
        $project: {
          thumbnail: 1,
          title: 1,
          description: 1,
          videoFile: 1,
          duration: 1,
          views: 1,
          isPublished: 1,
          createdAt: 1,
          createdBy: {
            avatar: 1,
            fullname: 1,
            username: 1,
          },
        },
      },
      {
        $sort: {
          [sortBy]: sortType === "asc" ? 1 : -1,
        },
      },
      {
        $skip: (pageNum - 1) * limitNum,
      },
      {
        $limit: limitNum,
      },
    ]);

    console.log(`Found ${videos.length} videos`);

    if (!videos || videos.length === 0) {
      return res
        .status(200)
        .json(new apiResponse(200, [], "No videos found"));
    }

    return res
      .status(200)
      .json(new apiResponse(200, videos, `Successfully fetched ${videos.length} videos`));

  } catch (error) {
    console.error("Error in getAllvideos:", error);
    throw new apiError(500, "Error while fetching videos: " + error.message);
  }
});

const updateVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video ID");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 }
    },
    { new: true }
  );

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, video, "Video views updated successfully"));
});

export {
  uploadVideo,
  deleteVideo,
  getVideobyId,
  updateVideo,
  togglePublishStatus,
  getAllvideos,
  updateVideoViews,
};
