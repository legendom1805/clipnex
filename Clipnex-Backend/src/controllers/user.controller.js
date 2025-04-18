import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost'
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken, newRefreshToken: refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("req.body", req.body);

  if (
    [username, fullname, email, password].some(
      (field) => field === undefined || field?.trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required !!");
  }

  // Check for existing email
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new apiError(409, `Email ${email} is already registered. Please use a different email or try logging in.`);
  }

  // Check for existing username
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new apiError(409, `Username "${username}" is already taken. Please choose a different username.`);
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }

  // Upload to Cloudinary or set default image
  const avatar = avatarLocalPath
    ? await uploadOnCloudinary(avatarLocalPath)
    : { url: "https://res.cloudinary.com/legendom/image/upload/v1736598411/bfehlrqg7l8pvjrnzvp0.png" }; // Default avatar

  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : { url: "https://res.cloudinary.com/legendom/image/upload/v1736598411/bfehlrqg7l8pvjrnzvp0.png" }; // Default cover image

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    avatar: avatar?.url || "https://yourcdn.com/default-avatar.png", // Ensure default
    coverImage: coverImage?.url || "https://yourcdn.com/default-cover.jpg",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(
      500,
      "Something went wrong while registering the user..!"
    );
  }

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered Successfully..!"));
});


const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new apiError(400, "Enter a valid email or username..!");
  }

  if (password === "" || password === undefined) {
    throw new apiError(400, "Password is required..!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apiError(404, "User does not exist..!");
  }

  const isPasswordvalid = await user.isPasswordCorrect(password);
  if (!isPasswordvalid) {
    throw new apiError(401, "Invalid user credentials");
  }

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    // Get refresh token from cookies or body
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new apiError(401, "Refresh token is missing. Please login again.");
    }

    // Verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new apiError(401, "Invalid refresh token. User not found.");
    }

    // Check if the refresh token matches the one stored in the database
    if (incomingRefreshToken !== user.refreshToken) {
      throw new apiError(401, "Refresh token has expired or been used. Please login again.");
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Set the new tokens as cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      })
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    // Clear the cookies if there's an error
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new apiError(401, "Invalid refresh token. Please login again.");
    }
    throw error;
  }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "Current User fetched Successfully"));
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const { fullname } = req.body;

  if (!fullname) {
    throw new apiError(400, "All fields are required!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new apiError(400, "Error while uploading image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponse(200, user, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const CoverImageLocalPath = req.file?.path;

  if (!CoverImageLocalPath) {
    throw new apiError(400, "Image is required");
  }

  const coverImage = await uploadOnCloudinary(CoverImageLocalPath);

  if (!coverImage) {
    throw new apiError(400, "Error while uploading image");
  }

  //TODO: Remove image from cloudinary

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponse(200, user, "CoverImage updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new apiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "AllsubscribersDocuments",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "AllSubscribedToDocuments",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
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
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              likes: 1,
              owner: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$AllsubscribersDocuments",
        },
        channelsSubscribedToCount: {
          $size: "$AllSubscribedToDocuments",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$AllsubscribersDocuments.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        videos: 1, // Include videos in the projection
      },
    },
  ]);

  console.log(channel);
  if (!channel?.length) {
    throw new apiError(404, "Channel does not exist");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, channel[0], "User Profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
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
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, user[0], "Watch history fetched successfully"));
});

const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video ID");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  // Add video to watch history if not already present
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { watchHistory: videoId } // $addToSet prevents duplicates
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new apiError(500, "Failed to update watch history");
  }

  return res
    .status(200)
    .json(new apiResponse(200, user, "Video added to watch history successfully"));
});

const removeFromWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video ID");
  }

  // Remove video from watch history
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { watchHistory: videoId } // $pull removes the specified value from the array
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new apiError(500, "Failed to update watch history");
  }

  return res
    .status(200)
    .json(new apiResponse(200, user, "Video removed from watch history successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateCurrentUser,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  addToWatchHistory,
  removeFromWatchHistory,
};
