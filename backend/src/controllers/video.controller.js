import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Like } from "../models/like.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50)
    const { query, sortBy, sortType, userId } = req.query
    const filter = { isPublished: true }

    if (query?.trim()) {
        filter.$or = [
            { title: { $regex: query.trim(), $options: "i" } },
            { description: { $regex: query.trim(), $options: "i" } },
        ]
    }
    if (userId) {
        if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id")
        filter.owner = userId
    }

    const sortField = ["createdAt", "views", "title"].includes(sortBy) ? sortBy : "createdAt"
    const sortDirection = sortType === "asc" ? 1 : -1
    const [videos, totalDocs] = await Promise.all([
        Video.find(filter)
            .populate("owner", "fullName username avatar")
            .sort({ [sortField]: sortDirection })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Video.countDocuments(filter),
    ])

    const videoIds = videos.map((video) => video._id)
    const likeCounts = await Like.aggregate([
        { $match: { video: { $in: videoIds } } },
        { $group: { _id: "$video", count: { $sum: 1 } } },
    ])
    const likedVideoIds = req.user
        ? await Like.find({ video: { $in: videoIds }, likedBy: req.user._id }).distinct("video")
        : []
    const likeCountByVideo = new Map(likeCounts.map((item) => [item._id.toString(), item.count]))
    const likedIds = new Set(likedVideoIds.map((id) => id.toString()))
    const enrichedVideos = videos.map((video) => ({
        ...video,
        likeCount: likeCountByVideo.get(video._id.toString()) || 0,
        isLiked: likedIds.has(video._id.toString()),
    }))

    return res.status(200).json(new ApiResponse(200, {
        docs: enrichedVideos,
        totalDocs,
        page,
        limit,
        totalPages: Math.ceil(totalDocs / limit),
    }, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body
    const videoFile = req.files?.videoFile?.[0]?.path
    const thumbnailFile = req.files?.thumbnail?.[0]?.path

    if (!title?.trim() || !description?.trim() || !duration) {
        throw new ApiError(400, "Title, description, and duration are required")
    }
    if (!videoFile || !thumbnailFile) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const numericDuration = Number(duration)
    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
        throw new ApiError(400, "Duration must be a positive number")
    }

    const [uploadedVideo, uploadedThumbnail] = await Promise.all([
        uploadOnCloudinary(videoFile),
        uploadOnCloudinary(thumbnailFile),
    ])
    if (!uploadedVideo || !uploadedThumbnail) {
        throw new ApiError(500, "Unable to upload video assets")
    }

    const video = await Video.create({
        videoFile: uploadedVideo.secure_url || uploadedVideo.url,
        thumbnail: uploadedThumbnail.secure_url || uploadedThumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: numericDuration,
        owner: req.user._id,
    })

    const createdVideo = await Video.findById(video._id)
        .populate("owner", "fullName username avatar")
        .lean()
    return res.status(201).json(new ApiResponse(201, createdVideo, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")

    const video = await Video.findOneAndUpdate(
        { _id: videoId, $or: [{ isPublished: true }, { owner: req.user._id }] },
        { $inc: { views: 1 } },
        { new: true }
    ).populate("owner", "fullName username avatar")

    if (!video) throw new ApiError(404, "Video not found")
    const [likeCount, isLiked] = await Promise.all([
        Like.countDocuments({ video: video._id }),
        req.user ? Like.exists({ video: video._id, likedBy: req.user._id }) : false,
    ])
    return res.status(200).json(new ApiResponse(200, {
        ...video.toObject(),
        likeCount,
        isLiked: Boolean(isLiked),
    }, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You can only update your own videos")

    if (req.body.title !== undefined) video.title = req.body.title.trim()
    if (req.body.description !== undefined) video.description = req.body.description.trim()
    if (req.file?.path) {
        const thumbnail = await uploadOnCloudinary(req.file.path)
        if (!thumbnail) throw new ApiError(500, "Unable to upload thumbnail")
        video.thumbnail = thumbnail.secure_url || thumbnail.url
    }
    await video.save()
    const updatedVideo = await Video.findById(video._id).populate("owner", "fullName username avatar")
    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You can only delete your own videos")
    await video.deleteOne()
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You can only update your own videos")
    video.isPublished = !video.isPublished
    await video.save()
    return res.status(200).json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
