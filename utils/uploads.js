import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";

// Directory for file uploads
const uploadDir = "./uploads";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${nanoid()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Multer upload configuration
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", // JPG images
      "image/png", // PNG images
      "image/jpg", // JPG images
      "image/gif", // GIF images (optional)
      "image/webp", // WEBP images (optional)
      "application/pdf", // PDF files
      "text/plain", // TXT files
      "application/msword", // DOC files (older Microsoft Word format)
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files (modern Microsoft Word format)
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export const uploadFiles = upload.fields([
  { name: "images", maxCount: 10 }, // Accept multiple images
  { name: "invoices", maxCount: 10 }, // Accept multiple invoices
  { name: "manuals", maxCount: 10 }, // Accept multiple manuals
]);
