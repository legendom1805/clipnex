import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const ifLiked = await Like.findOne({ video: videoId, likedBy: req.user._id });

  if (!ifLiked) {
    try {
      await Like.create({
        video: videoId,
        likedBy: req.user._id,
      });

      return res.status(200).json(new apiResponse(200, "liked", "like added"));
    } catch (error) {
      throw new apiError(500, "something went wrong while adding your like");
    }
  } else {
    try {
      await Like.findOneAndDelete({ video: videoId, likedBy: req.user._id });

      return res
        .status(200)
        .json(new apiResponse(200, "Unliked ", "Like removed"));
    } catch (error) {
      throw new apiError(
        500,
        "Something went wrong while removing your like !"
      );
    }
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new apiError(400, "Comment Id is not valid");
  }

  const ifCommentExist = await Comment.findById(commentId);

  if (!ifCommentExist) {
    throw new apiError(404, "The comment not found");
  }

  const likeOnComment = await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  });

  if (!likeOnComment) {
    try {
      await Like.create({
        comment: commentId,
        likedBy: req.user._id,
      });

      return res.status(200).json(new apiResponse(200, "liked", "like added"));
    } catch (error) {
      throw new apiError(500, "something went wrong when adding like");
    }
  } else {
    try {
      await Like.findByIdAndDelete(likeOnComment._id);

      return res
        .status(200)
        .json(new apiResponse(200, "Unliked", "Like removed"));
    } catch (error) {
      throw new apiError(
        500,
        "Something went wrong while removing your like on comment"
      );
    }
  }
});

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId || !isValidObjectId(postId)) {
    throw new apiError(404, "Provide Post id");
  }

  const ifPostExist = await Post.findById(postId);

  if (!ifPostExist) {
    throw new apiError("400", "Tweet not exist");
  }

  const post = await Like.findOne({ likedBy: req.user._id, post: postId });

  if (!post) {
    try {
      await Like.create({
        likedBy: req.user._id,
        post: postId,
      });

      return res.status(200).json(new apiResponse(200, "Liked", "liked added"));
    } catch (error) {
      throw new apiError(500, "something went wrong when adding your like");
    }
  } else {
    try {
      await Like.findByIdAndDelete(post._id);

      return res
        .status(200)
        .json(new apiResponse(200, "Unliked", "like removed"));
    } catch (error) {
      throw new apiError(
        500,
        "something went wrong when removing your like from tweet"
      );
    }
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        title: "$video.title",
        thumbnail: "$video.thumbnail",
        videoFile: "$video.videoFile",
        description: "$video.description",
        duration: "$video.duration",
        views: "$video.views",
        owner: {
          fullname: "$owner.fullName",
          username: "$owner.userName",
          avatar: "$owner.avatar",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, likedVideos, "liked videos fetched successfully")
    );
});

export { toggleCommentLike, togglePostLike, toggleVideoLike, getLikedVideos };
