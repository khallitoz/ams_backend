import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";

// Use memory storage for Backblaze upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

export const uploadFiles = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "invoices", maxCount: 5 },
  { name: "manuals", maxCount: 5 },
]);
