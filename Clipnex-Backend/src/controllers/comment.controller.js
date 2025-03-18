import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js";
import { apiResponse } from "../utils/apiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new apiError(400, "Video Id is not valid");
  }

  const comments = await Comment.aggregate([
    {
      $match: { video: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentBy",
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
      $unwind: "$commentBy",
    },
    {
      $project: {
        content: 1,
        owner: "$commentBy",
        createdAt: 1,
      },
    },
  ]);

  if (!comments.length > 0) {
    throw new apiError(400, "No comments");
  }

  return res
    .status(200)
    .json(new apiResponse(200, comments, "Comments fetched successfully!"));
});

const createVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new apiError(400, "Video Id is not valid");
  }

  if (!content) {
    throw new apiError(400, "Provide content for the comment");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new apiError(500, "Unable to create a comment");
  }

  return res
    .status(200)
    .json(new apiResponse(200, comment, "Comment added successfully"));
});

const createPostComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!postId || !isValidObjectId(postId)) {
    throw new apiError(400, "Post Id is not valid");
  }

  if (!content) {
    throw new apiError(400, "Provide content for the comment");
  }

  const comment = await Comment.create({
    content,
    post: postId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new apiError(500, "Unable to create a comment");
  }

  return res
    .status(200)
    .json(new apiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new apiError(400, "Comment Id is not valid!");
  }
  if (!content) {
    throw new apiError(404, "Provide content to update");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new apiError(404, "comment not found");
  }

  if (!comment.owner.equals(req.user._id)) {
    throw new apiError(
      405,
      "You are not owner of this comment, unable to edit"
    );
  }

  const isCommentUpdated = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    { new: true }
  );

  if (!isCommentUpdated) {
    throw new apiError(500, "Something went wrong while updating your comment");
  }

  return res
    .status(200)
    .json(new apiError(200, {}, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new apiError(404, "Comment not found");
  }

  if (!comment.owner.equals(req.user._id)) {
    throw new apiError(405, "You are not allowed to delete this comment!");
  }

  const isDeleted = await Comment.findByIdAndDelete(commentId);

  if (!isDeleted) {
    throw new apiError(
      500,
      "Something went wrong while deleting your comment "
    );
  }

  //   await Like.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new apiError(200, {}, "Comment deleted successfully"));
});

export {
  getVideoComments,
  createVideoComment,
  createPostComment,
  updateComment,
  deleteComment,
};
