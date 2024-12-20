import express from "express";
import { uploadFiles } from "../utils/uploads.js";
import { addHardwareDetails } from "../controllers/addHardwareDetails.js";
import { requestAllAssets } from "../controllers/requestAllAssets.js";
import { requestAllSingleAssets } from "../controllers/requestAllSingleAssets.js";

const router = express.Router();

// Upload files and add hardware details
router.post("/addhardware", uploadFiles, addHardwareDetails);
router.get("/requestallassets", requestAllAssets);
router.get("/requestsingleasset", requestAllSingleAssets);


export default router;
