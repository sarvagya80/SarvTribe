import multer from "multer";

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
        return cb(null, true);
    }
    cb(new Error("File type not supported. Only images and videos are allowed."));
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB file size limit
    },
    fileFilter: fileFilter,
});