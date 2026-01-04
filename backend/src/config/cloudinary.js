import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnrvdjpef',
    api_key: process.env.CLOUDINARY_API_KEY || '591947575131527',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'ARH1KaPuOQMyEhU32F-cPvQr78Q',
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'yarn-products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
});

export const upload = multer({ storage: storage });
export default cloudinary;
