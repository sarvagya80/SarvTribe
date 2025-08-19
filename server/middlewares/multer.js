// src/middlewares/multer.js

import multer from "multer";

const fileFilter = (req, file, cb) => {
    // ✅ I've added more common file types like 'heic' and 'webm'.
    // You can add any other types you need to support here.
    const allowedTypes = /jpeg|jpg|png|gif|webp|heic|mp4|mov|avi|webm/;
    
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
        return cb(null, true); // Accept the file
    }
    // Reject the file with a specific error message
    cb(new Error("File type not supported. Please upload a valid image or video."));
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB file size limit
    },
    fileFilter: fileFilter,
});