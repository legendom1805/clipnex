import { isValidObjectId } from "mongoose";
import { Post } from "../models/post.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new apiError(401, "Provide content for post");
  }

  const createPost = await Post.create({
    content,
    owner: req.user._id,
  });

  if (!createPost) {
    throw new apiError(500, "Unable to create post");
  }

  return res
    .status(200)
    .json(new apiResponse(200, createPost, "Post Created Successfully"));
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new apiError(400, "User Id is not valid!");
  }

  const posts = await Post.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "created_by",
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
      $unwind: "$created_by",
    },
    {
      $project: {
        content: 1,
        owner: "$created_by",
      },
    },
  ]);

  if (!posts.length > 0) {
    throw new apiError(400, "No Post found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, posts, "Posts Fetched Successfully!"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new apiError(400, "Please provide content to update");
  }
  if (!postId || !isValidObjectId(postId)) {
    throw new apiError(400, "Post Id is not valid!");
  }

  const post = await Post.findById(postId);

  if (!post.owner.equals(req.user._id)) {
    throw new apiError(400, "You are not allowed to update this video!");
  }

  const updateContent = await Post.findByIdAndUpdate(
    postId,
    { $set: { content } },
    { new: true }
  );

  if (!updateContent) {
    throw new apiError(500, "Can't update post");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updateContent, "Post updated successfully!"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new apiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new apiError(404, "Post not found");
  }

  // Check if the user is the owner of the post
  if (!post.owner.equals(req.user._id)) {
    throw new apiError(403, "You are not authorized to delete this post");
  }

  const deletedPost = await Post.findByIdAndDelete(postId);

  if (!deletedPost) {
    throw new apiError(500, "Failed to delete post");
  }

  return res
    .status(200)
    .json(new apiResponse(200, deletedPost, "Post deleted successfully"));
});

const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const posts = await Post.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $sort: sort,
    },
    {
      $skip: skip,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  const totalPosts = await Post.countDocuments();

  return res
    .status(200)
    .json(
      new apiResponse(200, {
        posts,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / parseInt(limit)),
        totalPosts,
      }, "Posts fetched successfully")
    );
});

export { createPost, getUserPosts, updatePost, deletePost, getAllPosts };
