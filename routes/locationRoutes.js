import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  addDepartmentToLocation,
  addBuildingToLocation,
  addRoomToBuilding,
  importLocationsFromExcel,
  getLocationsForDropdown,
} from "../controllers/locationController.js";
import dbConnection from "../middleware/dbConnection.js";
import withModels from "../middleware/withModels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Set up file storage for Excel uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow only Excel files
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".xlsx", ".xls", ".csv"];

    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed (.xlsx, .xls, .csv)"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

// Serve template file
router.get("/template", (req, res) => {
  const templatePath = path.join(
    __dirname,
    "../public/templates/location_template.csv"
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=location_template.csv"
  );
  res.sendFile(templatePath);
});

// Location routes
router.get("/", dbConnection, withModels(getAllLocations));
router.get("/dropdown", dbConnection, withModels(getLocationsForDropdown));
router.get("/:id", dbConnection, withModels(getLocationById));
router.post("/", dbConnection, withModels(createLocation));
router.put("/:id", dbConnection, withModels(updateLocation));
router.delete("/:id", dbConnection, withModels(deleteLocation));

// Department routes
router.post(
  "/:id/buildings/:buildingId/departments",
  dbConnection,
  withModels(addDepartmentToLocation)
);

// Building routes
router.post("/:id/buildings", dbConnection, withModels(addBuildingToLocation));

// Room routes
router.post(
  "/:locationId/buildings/:buildingId/departments/:departmentId/rooms",
  dbConnection,
  withModels(addRoomToBuilding)
);

// Import route
router.post(
  "/import",
  upload.single("file"),
  dbConnection,
  withModels(importLocationsFromExcel)
);

export default router;
