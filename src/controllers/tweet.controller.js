import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  // create tweet
  const content = req.body;
  if (!content || typeof content !== "string") {
    throw new ApiError(400, "Content must be a string");
  }

  const tweet = await Tweet.create({
    owner: req.user._id,
    content,
  });

  if (!tweet) {
    throw new ApiError(500, "Error creating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // get user tweets
  const userId = req.params;
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
  };

  const tweets = await Tweet.aggregatePaginate({ owner: userId }, options);

  if (!tweets) {
    throw new ApiError(404, "Tweets not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  // update tweet

  const { tweetId } = req.params;
  const { content } = req.body;

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $set: { content: content } },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "No such tweet exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  // delete tweet

  const { tweetId } = req.params;

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(404, "No such tweet exists.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
