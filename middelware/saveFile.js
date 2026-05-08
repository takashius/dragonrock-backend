import multer from 'multer';
import config from '../config.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.CLOUDINARY_KEY,
  api_secret: config.cloudinary.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: config.cloudinary.FOLDER_NAME,
    allowedFormats: ['jpeg', 'png', 'jpg'],
  }
});

const upload = multer({ storage });
export default upload;