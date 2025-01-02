import express from "express";
import { uploadFiles } from "../utils/uploads.js";
import { addHardwareDetails } from "../controllers/addHardwareDetails.js";
import {
  requestAllAssets,
  requestCheckOutassets,
  requestCheckInassets,
  requestInActiveassets,
  tabbarCounter,
  requestSoftwareAssets,
} from "../controllers/requestAllAssets.js";
import {
  addSoftware,
  updateSoftware,
  retrieveSoftwareList,
} from "../controllers/addSoftware.js";

import {
  requestAllSingleAssets,
  requestSoftwareAssetDetails,
  fetchAssociatedHardwares,
} from "../controllers/requestAllSingleAssets.js";
import { assignAsset } from "../controllers/assignAsset.js";
import { fetchAssignAsset } from "../controllers/fetchassignasset.js";
import { updateHardware } from "../controllers/updateHardware.js";
import {
  submitInstalledSoftware,
  fetchInstalledSoftwares,
  deleteSoftwareDetails,
} from "../controllers/submitInstalledSoftware.js";
const router = express.Router();

// Upload files and add hardware details
router.post("/addhardware", uploadFiles, addHardwareDetails);
router.post("/addsoftware", addSoftware);
router.get("/retrievesoftwarelist", retrieveSoftwareList);
router.get("/requestallassets", requestAllAssets);
router.get("/requestcheckinassets", requestCheckInassets);
router.get("/requestcheckoutassets", requestCheckOutassets);
router.get("/requestinactiveassets", requestInActiveassets);
router.get("/tabbarcounter", tabbarCounter);
router.get("/requestsoftwareassets", requestSoftwareAssets);
router.get("/requestsingleasset", requestAllSingleAssets);
router.get("/requestsoftwareassetdetails", requestSoftwareAssetDetails);
router.post("/assignasset", assignAsset);
router.post("/submitinstalledsoftware", submitInstalledSoftware);
router.post("/deletesoftwareinfo", deleteSoftwareDetails);
router.get("/fetchinstalledsoftwares", fetchInstalledSoftwares);
router.get("/fetchassignasset", fetchAssignAsset);
router.put("/updatehardware/:id", uploadFiles, updateHardware);
router.get("/fetchassociatedhardwares", fetchAssociatedHardwares);
router.put("/updatesoftware/:id", updateSoftware);

export default router;
