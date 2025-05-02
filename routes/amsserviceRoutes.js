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
import { fetchAssetInfo } from "../controllers/fetchAssetInfo.js";
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
import {
  fetchSoftwareCategoryData,
  fetchMaintenanceData,
  addBulkMaintenance,
  installSelectedCategories,
  fetchSingleSoftwareCategoryData,
  fetchAllMaintenance,
} from "../controllers/fetchSoftwareCategoryData.js";
import { getAllUsers } from "../controllers/getAllUsers.js";
import withModels from "../middleware/withModels.js";
import dbConnection from "../middleware/dbConnection.js";
import { updateMaintenanceStatus } from "../controllers/updateMaintenanceStatus.js";
// Import dashboard controllers
import {
  getDashboardCounters,
  getHardwareByType,
  getHardwareByStatus,
  getSoftwareByCategory,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Routes now only need withModels as dbConnection is applied to all routes
router.post(
  "/addhardware",
  dbConnection,
  uploadFiles,
  withModels(addHardwareDetails)
);
router.post("/addsoftware", dbConnection, withModels(addSoftware));
router.get(
  "/retrievesoftwarelist",
  dbConnection,
  withModels(retrieveSoftwareList)
);
router.get("/requestallassets", dbConnection, withModels(requestAllAssets));
router.get(
  "/requestcheckinassets",
  dbConnection,
  withModels(requestCheckInassets)
);
router.get(
  "/requestcheckoutassets",
  dbConnection,
  withModels(requestCheckOutassets)
);
router.get(
  "/requestinactiveassets",
  dbConnection,
  withModels(requestInActiveassets)
);
router.get("/tabbarcounter", dbConnection, withModels(tabbarCounter));
router.get(
  "/requestsoftwareassets",
  dbConnection,
  withModels(requestSoftwareAssets)
);
router.get(
  "/requestsingleasset",
  dbConnection,
  withModels(requestAllSingleAssets)
);
router.get(
  "/requestsoftwareassetdetails",
  dbConnection,
  withModels(requestSoftwareAssetDetails)
);
router.post("/assignasset", dbConnection, withModels(assignAsset));
router.post(
  "/submitinstalledsoftware",
  dbConnection,
  withModels(submitInstalledSoftware)
);
router.post(
  "/deletesoftwareinfo",
  dbConnection,
  withModels(deleteSoftwareDetails)
);
router.get(
  "/fetchinstalledsoftwares",
  dbConnection,
  withModels(fetchInstalledSoftwares)
);
router.get("/fetchassignasset", dbConnection, withModels(fetchAssignAsset));
router.put(
  "/updatehardware/:id",
  dbConnection,
  uploadFiles,
  withModels(updateHardware)
);
router.get(
  "/fetchassociatedhardwares",
  dbConnection,
  withModels(fetchAssociatedHardwares)
);
router.put("/updatesoftware/:id", dbConnection, withModels(updateSoftware));
router.get(
  "/fetchSoftwarecategorydata",
  dbConnection,
  withModels(fetchSoftwareCategoryData)
);
router.post(
  "/installselectedcategories",
  dbConnection,
  withModels(installSelectedCategories)
);
router.get(
  "/fetchsingleSoftwarecategorydata",
  dbConnection,
  withModels(fetchSingleSoftwareCategoryData)
);
router.get("/fetchassetinfo", dbConnection, withModels(fetchAssetInfo));
router.get(
  "/fetchmaintenancedata",
  dbConnection,
  withModels(fetchMaintenanceData)
);
router.post(
  "/addbulkmaintenance",
  dbConnection,
  withModels(addBulkMaintenance)
);
router.put(
  "/updatemaintenancestatus/:id",
  dbConnection,
  withModels(updateMaintenanceStatus)
);
router.get(
  "/fetchallmaintenance",
  dbConnection,
  withModels(fetchAllMaintenance)
);

// Add route for getting all users
router.get("/users", dbConnection, withModels(getAllUsers));

// Dashboard endpoints
router.get(
  "/dashboard/counters",
  dbConnection,
  withModels(getDashboardCounters)
);
router.get(
  "/dashboard/hardware-by-type",
  dbConnection,
  withModels(getHardwareByType)
);
router.get(
  "/dashboard/hardware-by-status",
  dbConnection,
  withModels(getHardwareByStatus)
);
router.get(
  "/dashboard/software-by-category",
  dbConnection,
  withModels(getSoftwareByCategory)
);

export default router;
