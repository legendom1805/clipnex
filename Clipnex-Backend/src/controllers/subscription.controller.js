import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Subscription } from "../models/subscription.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
const toggleSubscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid Channel Id!");
  }

  const findsub = await Subscription.findOne({
    $and: [{ subscriber: req.user._id }, { channel: channelId }],
  });

  if (!findsub) {
    const subscribe = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    if (!subscribe) {
      throw new apiError(500, "Error while subscribing!");
    }

    return res
      .status(200)
      .json(new apiResponse(200, subscribe, "Channel Subscribed!"));
  } else {
    const unsubscribe = await Subscription.findByIdAndDelete(findsub._id);
    if (!unsubscribe) {
      throw new apiError(500, "Error while Unsubscribing!");
    }

    return res
      .status(200)
      .json(new apiResponse(200, unsubscribe, "Channel Unsubscribed!"));
  }
});

const findSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid Channel Id!");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        subscriber: {
          fullname: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
  ]);

  const info = {
    subscribers: subscribers || [],
    totalSubscribers: subscribers.length || 0,
  };

  return res
    .status(200)
    .json(new apiResponse(200, info, "Subscribers fetched successfully!"));
});

const findSubscribedTo = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new apiError(400, "Invalid Subscriber Id!");
  }

  const subscribedTo = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
      },
    },
    {
      $unwind: "$channels",
    },
    {
      $project: {
        channels: { fullname: 1, username: 1, avatar: 1 },
      },
    },
  ]);
  const info = {
    subscribedTo: subscribedTo || [],
    totalChannelsSubscribed: subscribedTo.length || 0,
  };

  return res
    .status(200)
    .json(
      new apiResponse(200, info, "Subscribed Channels fetched successfully!")
    );
});
export { toggleSubscribe, findSubscribers, findSubscribedTo };
