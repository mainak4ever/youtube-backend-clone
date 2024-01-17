import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Toggle like on video
  const like = await Like.findOne({ video: videoId });

  if (!like) {
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Server Error: Unable to Like");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Like added successfully"));
  } else {
    const deletedLike = await Like.findByIdAndDelete(like._id);

    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like deleted successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Toggle like on comment
  const like = await Like.findOne({ comment: commentId });

  if (!like) {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Server Error: Unable to Like");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Like added successfully"));
  } else {
    const deletedLike = await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like deleted successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Toggle like on tweet
  const like = await Like.findOne({ tweet: tweetId });

  if (!like) {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Server Error: Unable to Like");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Like added successfully"));
  } else {
    const deletedLike = await Like.findByIdAndDelete(like._id);

    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like deleted successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // get all liked videos
  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: req.user._id },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        $project: {
          _id: 1,
          thumbnail: 1,
          title: 1,
          duration: 1,
          views: 1,
          isPublished: 1,
          owner: 1,
        },
      },
    },
  ]);

  if (!likedVideos) {
    new ApiError(500, "Error fetching liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked Videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
