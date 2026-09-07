import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    if (!await Video.exists({ _id: videoId })) throw new ApiError(404, "Video not found")
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50)
    const filter = { video: videoId }
    const [comments, totalDocs] = await Promise.all([
        Comment.find(filter).populate("owner", "fullName username avatar").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Comment.countDocuments(filter),
    ])
    return res.status(200).json(new ApiResponse(200, { docs: comments, totalDocs, page, limit }, "Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    if (!content?.trim()) throw new ApiError(400, "Comment content is required")
    if (!await Video.exists({ _id: videoId })) throw new ApiError(404, "Video not found")
    const comment = await Comment.create({ content: content.trim(), video: videoId, owner: req.user._id })
    const createdComment = await Comment.findById(comment._id).populate("owner", "fullName username avatar")
    return res.status(201).json(new ApiResponse(201, createdComment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    if (!mongoose.isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id")
    if (!content?.trim()) throw new ApiError(400, "Comment content is required")
    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404, "Comment not found")
    if (comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You can only update your own comments")
    comment.content = content.trim()
    await comment.save()
    const updatedComment = await Comment.findById(comment._id).populate("owner", "fullName username avatar")
    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!mongoose.isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id")
    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404, "Comment not found")
    if (comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You can only delete your own comments")
    await comment.deleteOne()
    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
