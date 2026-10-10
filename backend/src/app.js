import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

app.use((error, req, res, next) => {
    const isMulterLimitError = typeof error.code === "string" && error.code.startsWith("LIMIT_");
    const statusCode = error.statusCode
        || (error.code === "LIMIT_FILE_SIZE" ? 413 : isMulterLimitError ? 400 : 500);
    const message = error.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file exceeds the allowed size"
        : isMulterLimitError
            ? "Invalid multipart upload"
            : statusCode >= 500
                ? "Internal server error"
                : error.message || "Request failed";

    if (statusCode >= 500) {
        console.error("Request failed", { name: error.name, message: error.message });
    }

    res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: statusCode >= 500 ? [] : error.errors || [],
    });
})

// http://localhost:8000/api/v1/users/register

export { app }