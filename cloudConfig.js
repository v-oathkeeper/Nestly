const cloudinary = require('cloudinary').v2;
const { cloudinaryStorage, CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nestly_DEV',
        allowedFormats: ["png", "jpg", "jpeg"],
        resource_type: 'image',
    },
});

module.exports = {
    cloudinary,
    storage,
};