import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError } from "../utils/ApiError.js";

const tempDirectory = fileURLToPath(new URL("../../public/temp/", import.meta.url));
mkdirSync(tempDirectory, { recursive: true });

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedExtensionsByMime = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
    "video/quicktime": [".mov"],
    "video/x-matroska": [".mkv"],
};

const imageFields = new Set(["avatar", "coverImage", "thumbnail"]);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, tempDirectory),
    filename: (_req, file, cb) => {
        // Never use client-supplied filenames as paths on the server.
        const extension = extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${extension}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const extension = extname(file.originalname).toLowerCase();
    const extensionMatchesMime = allowedExtensionsByMime[file.mimetype]?.includes(extension);
    const isVideoField = file.fieldname === "videoFile";
    const isImageField = imageFields.has(file.fieldname);

    if (!extensionMatchesMime || (!isVideoField && !isImageField)) {
        return cb(new ApiError(400, "Unsupported file type for this upload field"));
    }

    if (isVideoField && !file.mimetype.startsWith("video/")) {
        return cb(new ApiError(400, "A video file is required"));
    }

    if (isImageField && !file.mimetype.startsWith("image/")) {
        return cb(new ApiError(400, "An image file is required"));
    }

    return cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_VIDEO_SIZE,
        files: 2,
        fields: 10,
        parts: 12,
        fieldNameSize: 100,
        fieldSize: 16 * 1024,
    },
});

// Apply after Multer. Image limits are field-specific, while Multer's hard
// cap prevents any individual upload from exceeding the video limit.
export const validateUploadedFiles = (req, _res, next) => {
    const files = [
        ...(req.file ? [req.file] : []),
        ...Object.values(req.files || {}).flat(),
    ];

    const oversizedImage = files.some(
        (file) => file.fieldname !== "videoFile" && file.size > MAX_IMAGE_SIZE
    );

    if (oversizedImage) {
        return next(new ApiError(413, "Image files must be 5 MB or smaller"));
    }

    return next();
};

// Remove files left in temp storage when a controller rejects a request early.
// Successful Cloudinary uploads may already have removed them; ENOENT is safe.
export const cleanupTempFiles = (req, res, next) => {
    const files = [
        ...(req.file ? [req.file] : []),
        ...Object.values(req.files || {}).flat(),
    ];

    res.on("finish", () => {
        for (const file of files) {
            unlink(file.path).catch(() => {});
        }
    });

    return next();
};
