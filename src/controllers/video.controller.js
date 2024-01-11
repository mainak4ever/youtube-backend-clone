import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // get all videos based on query, sort, pagination

  const filters = {};
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  if (query) {
    filters.title = { $regex: new RegExp(query, "i") };
  }

  if (userId) {
    filters.owner = userId;
  }

  const sortCriteria = {};
  if (sortBy) {
    sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sortCriteria = { createdAt: -1 };
  }

  const videos = await Video.aggregatePaginate(
    [{ $match: filters }, { $sort: sortCriteria }],
    options
  );

  if (!videos) {
    throw new ApiError(404, "No Videos Found");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, " Title and Thumbnail are required");
  }

  // get video, upload to cloudinary, create video

  const videoPath = req.files?.videoFile[0]?.path;

  if (!videoPath) {
    throw new ApiError(400, "Video file is required");
  }

  let thumbnailPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailPath = req.files?.thumbnail[0]?.path;
  }

  const videoFile = await uploadOnCloudinary(videoPath);

  if (!videoFile) {
    throw new ApiError(500, "Failed To Upload The Video");
  }

  if (thumbnailPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    if (!thumbnail) {
      throw new ApiError(500, "Failed To Upload The thumbnail");
    }
  }

  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url || "",
    title,
    description,
    owner: req.user._id,
    duration: videoFile?.duration || 0,
  });

  if (!video) {
    throw new ApiError(500, "Server Error while creating the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // get video by id

  const video = await Video.findById(mongoose.Types.ObjectId(videoId)).populate(
    "owner",
    ["username", "fullname", "avatar"]
  );

  if (!video) {
    return new ApiError("404", "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const videoUpdates = { ...req.body };
  // update video details like title, description, thumbnail

  if (videoUpdates?.thumbnail) {
    const thumbnailPath = req.files?.thumbnail[0]?.path;

    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    if (!thumbnail) {
      throw new ApiError(500, "Failed To Upload The thumbnail");
    }

    videoUpdates.thumbnail = thumbnail.url;
  }

  const video = await Video.findByIdAndUpdate(
    mongoose.Types.ObjectId(videoId),
    { $set: { ...videoUpdates } },
    { new: true }
  );

  if (!video) {
    return new ApiError("404", "Video not found");
  }

  // TODO: Delete old thumbnail from cloudinary

  return res
    .status(200)
    .json(new ApiResponse(200, video, `Video with id ${videoId} updated`));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // delete video
  const video = await Video.findById(videoId);
  if (!video) {
    return new ApiError(404, "Video not found");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    return new ApiError(500, "Error Occurred: Video not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    return new ApiError(404, "Video not found");
  }

  // Toggle the isPublished status and save
  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Published status updated"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
