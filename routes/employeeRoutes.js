import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeTemplate,
  importEmployeesFromExcel,
} from "../controllers/employeeController.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import dbConnection from "../middleware/dbConnection.js";
import withModels from "../middleware/withModels.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file extension
    const filetypes = /xlsx|xls|csv/;
    const originalname = file.originalname.toLowerCase();
    const extname = path.extname(originalname);
    const extMatch = filetypes.test(extname.toLowerCase().substring(1));

    // Check MIME type
    const mimetypes =
      /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application\/vnd.ms-excel|text\/csv/;
    const mimeMatch = mimetypes.test(file.mimetype);

    console.log(
      `File upload attempt: ${originalname}, Extension: ${extname}, Mimetype: ${file.mimetype}`
    );

    // Accept if either extension or mimetype matches
    if (extMatch || mimeMatch) {
      return cb(null, true);
    } else {
      return cb(
        new Error(
          `Error: Only Excel files (xlsx, xls) or CSV files are allowed! Received file: ${originalname} with mimetype: ${file.mimetype}`
        )
      );
    }
  },
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message,
    });
  } else if (err) {
    // An unknown error occurred when uploading
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }
  next();
};

// Routes
router
  .route("/")
  .get(dbConnection, withModels(getAllEmployees))
  .post(dbConnection, withModels(createEmployee));

// Place specific routes before parameterized routes
router.route("/template").get(getEmployeeTemplate);

// Debug route to test file uploads
router.post("/debug-upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Debug upload error:", err.message);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded",
      });
    }

    console.log("File upload successful:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    return res.status(200).json({
      success: true,
      message: "File upload successful",
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  });
});

router.route("/import").post(
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }
      next();
    });
  },
  dbConnection,
  withModels(importEmployeesFromExcel)
);

// Dynamic ID route should come after specific routes
router
  .route("/:id")
  .get(dbConnection, withModels(getEmployeeById))
  .put(dbConnection, withModels(updateEmployee))
  .delete(dbConnection, withModels(deleteEmployee));

export default router;
