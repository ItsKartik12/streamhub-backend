import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload, cleanupTempFiles, validateUploadedFiles } from "../middlewares/multer.middleware.js"
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js"

const router = Router();

router
    .route("/")
    .get(optionalAuth, getAllVideos)
    .post(
        verifyJWT,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        cleanupTempFiles,
        validateUploadedFiles,
        publishAVideo
    );

router
    .route("/:videoId")
    .get(optionalAuth, getVideoById)
    .delete(verifyJWT, deleteVideo)
    .patch(verifyJWT, upload.single("thumbnail"), cleanupTempFiles, validateUploadedFiles, updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router