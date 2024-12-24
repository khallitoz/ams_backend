import express from "express";
import { uploadFiles } from "../utils/uploads.js";
import { addHardwareDetails } from "../controllers/addHardwareDetails.js";
import { requestAllAssets } from "../controllers/requestAllAssets.js";
import { requestAllSingleAssets } from "../controllers/requestAllSingleAssets.js";
import { assignAsset } from "../controllers/assignAsset.js";
import { fetchAssignAsset } from "../controllers/fetchassignasset.js";
import { updateHardware } from "../controllers/updateHardware.js";
const router = express.Router();

// Upload files and add hardware details
router.post("/addhardware", uploadFiles, addHardwareDetails);
router.get("/requestallassets", requestAllAssets);
router.get("/requestsingleasset", requestAllSingleAssets);
router.post("/assignasset", assignAsset);
router.get("/fetchassignasset", fetchAssignAsset);
router.put("/updatehardware/:id", uploadFiles, updateHardware);

export default router;
