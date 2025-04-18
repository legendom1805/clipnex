import { Playlist } from "../models/playlist.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name || description)) {
    throw new apiError(401, "Name and Description both are required!");
  }

  const existingPlaylist = await Playlist.findOne({
    $and: [{ name: name }, { owner: req.user._id }],
  });

  if (existingPlaylist) {
    throw new apiError(401, "Playlist already exists!");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new apiError(401, "Error while creating playlist!");
  }

  return res
    .status(200)
    .json(new apiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid User ID");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
          {
            $project: {
              title: 1,
              thumbnail: 1,
              description: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },
      },
    },
    {
      $project: {
        videos: 1,
        createdBy: 1,
        name: 1,
        description: 1,
      },
    },
  ]);

  if (playlists.length === 0) {
    throw new apiError(400, "No playlist found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, playlists, "Playlists fetched successfully!"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid User ID");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
          {
            $project: {
              title: 1,
              description: 1,
              thumbnail: 1,
              owner: 1,
              duration: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        createdBy: 1,
      },
    },
  ]);

  if (!playlist) {
    throw new apiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, playlist, "Playlist fetched!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    throw new apiError(401, "Invlaid VideoId or PlaylistId");
  }

  const playlist = await Playlist.findById(playlistId);
  console.log(playlist)

  if (!playlist) {
    throw new apiError(401, "Playlist not found");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new apiError(
      401,
      "You are not allowed to upload video in this playlist!"
    );
  }

  console.log(playlist.videos)

  const existedVideo = (playlist.videos).filter(
    (video) => video.toString() === videoId
  );

  if (existedVideo.length>0) {
    throw new apiError(401, "Video already exists");
  }

  const addVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        videos: [...playlist.videos, videoId],
      },
    },
    { new: true }
  );

  if (!addVideo) {
    throw new apiError(500, "Failed to add video!");
  }

  return res
    .status(200)
    .json(new apiResponse(200, addVideo, "Video added Successfully!"));
});

const removeVideofromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    throw new apiError(401, "Invlaid VideoId or PlaylistId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new apiError(401, "Playlist not found");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new apiError(
      401,
      "You are not allowed to upload video in this playlist!"
    );
  }

  const existedVideo = playlist.videos.filter(
    (video) => video.toString() === videoId
  );

  if (!existedVideo) {
    throw new apiError(401, "Video is not in the playlist!");
  }

  const modifiedPlaylist = playlist.videos.filter(
    (video) => video.toString() !== videoId
  );

  const deletevideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        videos: modifiedPlaylist,
      },
    },
    { new: true }
  );

  if (!deletevideo) {
    throw new apiError(500, "Failed to delete video!");
  }

  return res
    .status(200)
    .json(new apiResponse(200, deletevideo, "Video deleted successfully!"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new apiError(401, "PlaylistId is not valid");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new apiError(401, "Playlist not found!");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new apiError(401, "You are not allowed to modify this playist");
  }

  const updates = {};

  if (name) updates.name = name;
  if (description) updates.description = description;

  if (Object.keys(updates).length > 0) {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: updates,
      },
      { new: true }
    );
    if (!updatedPlaylist) {
      throw new apiError(500, "Playlist details update failed!");
    }
    return res
      .status(200)
      .json(
        new apiResponse(200, updatedPlaylist, "Playlist updated successfully!")
      );
  }

  throw new apiError(400, "No updates provided");
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid Playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new apiError(404, "Playlist not found");
  }

  // Check if the user is the owner of the playlist
  if (!playlist.owner.equals(req.user._id)) {
    throw new apiError(403, "You are not authorized to delete this playlist");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new apiError(500, "Failed to delete playlist");
  }

  return res
    .status(200)
    .json(new apiResponse(200, deletedPlaylist, "Playlist deleted successfully"));
});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideofromPlaylist,
  updatePlaylist,
  deletePlaylist,
};
