import { v2 as cloudinary } from "cloudinary";
import { unlink } from "node:fs/promises";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, resourceType = "image") => {
    if (!localFilePath) return null;

    try {
        return await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
        });
    } catch (_error) {
        // Keep provider details and credentials out of API responses.
        return null;
    } finally {
        // Best-effort cleanup on both success and failure.
        await unlink(localFilePath).catch(() => {});
    }
};

export { uploadOnCloudinary };
