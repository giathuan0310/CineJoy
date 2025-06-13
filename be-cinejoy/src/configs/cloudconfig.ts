import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Log environment variables for debugging
console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('Cloudinary connection failed:', error);
    } else {
        console.log('Cloudinary connection successful:', result);
    }
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "cinejoy",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    } as any,
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
});

export default upload;
