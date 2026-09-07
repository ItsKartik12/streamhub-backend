import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel id")
    if (channelId.toString() === req.user._id.toString()) throw new ApiError(400, "You cannot subscribe to yourself")
    if (!await User.exists({ _id: channelId })) throw new ApiError(404, "Channel not found")
    const existingSubscription = await Subscription.findOne({ subscriber: req.user._id, channel: channelId })
    if (existingSubscription) {
        await existingSubscription.deleteOne()
        return res.status(200).json(new ApiResponse(200, { subscribed: false }, "Channel unsubscribed successfully"))
    }
    await Subscription.create({ subscriber: req.user._id, channel: channelId })
    return res.status(201).json(new ApiResponse(201, { subscribed: true }, "Channel subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel id")
    if (!await User.exists({ _id: channelId })) throw new ApiError(404, "Channel not found")
    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "fullName username avatar").sort({ createdAt: -1 }).lean()
    return res.status(200).json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid subscriber id")
    if (subscriberId.toString() !== req.user._id.toString()) throw new ApiError(403, "You can only view your own subscriptions")
    const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate("channel", "fullName username avatar coverImage").sort({ createdAt: -1 }).lean()
    return res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}