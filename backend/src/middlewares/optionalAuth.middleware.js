import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const optionalAuth = async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) return next()

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = await User.findById(decodedToken?._id).select("-password -refreshToken") || undefined
    } catch {
        req.user = undefined
    }
    next()
}