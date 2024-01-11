import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found ");
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }, // Sorting comments by createdAt in descending order
  };

  const comments = await Comment.aggregatePaginate(
    { video: video._id },
    options
  );

  if (!comments) {
    throw new ApiError(404, "Internal Server Error while searching comments");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, " Comments retrieved successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const content = req.body;

  // add a comment to a video

  if (!content) {
    throw new ApiError(400, "Content is empty");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found ");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Server error while creating a comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  // update a comment

  const comment = await Comment.findByIdAndUpdate(
    mongoose.Types.ObjectId(commentId),
    { $set: { content: content } },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, "No such comment exists!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // delete a comment
  const comment = await Comment.findByIdAndDelete(
    mongoose.Types.ObjectId(commentId)
  );

  if (!comment) {
    throw new ApiError(404, "No Such Comment Exists");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Deleted the comment"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
