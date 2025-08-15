import multer from "multer";

// 1. Define a file filter function to validate file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
        return cb(null, true); // Accept the file
    }
    // Reject the file with a specific error message
    cb(new Error("File type not supported. Only images and videos are allowed."));
};

// 2. Configure multer with memory storage, size limits, and the file filter
export const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage for cloud uploads
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB file size limit
    },
    fileFilter: fileFilter,
});