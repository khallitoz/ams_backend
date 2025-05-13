import axios from "axios";
import { StatusCodes } from "http-status-codes";

export const fetchAllDevices = async (req, res) => {
  try {
    // Get client ID from request
    const clientId = req.client_id;

    // Get pagination and search parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchQuery = req.query.searchQuery || "";

    if (!clientId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Client ID is required",
      });
    }

    // Step 1: Get the access token
    // Get client ID and secret from environment variables
    const client = process.env.WITHSECURE_CLIENT_ID;
    const secret = process.env.WITHSECURE_CLIENT_SECRET;
    const organizationId = process.env.WITHSECURE_ORGANISATIONID;

    if (!client || !secret || !organizationId) {
      console.error(
        "Missing required environment variables for WithSecure API"
      );
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Missing required environment variables for WithSecure API",
      });
    }

    // Create basic auth by encoding client:secret
    const basic = btoa(`${client}:${secret}`);

    // Create axios instance with custom headers for token request
    const tokenConfig = {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "NodeJs",
      },
    };

    // Create form data for the token request
    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("scope", "connect.api.read");

    // Make the token request
    const tokenResponse = await axios.post(
      "https://api.connect.withsecure.com/as/token.oauth2",
      formData.toString(),
      tokenConfig
    );

    const tokenData = tokenResponse.data;
    console.log("Access token received:", tokenData);

    if (!tokenData.access_token) {
      throw new Error("No access token received");
    }

    // Step 2: Use the token to fetch devices
    const devicesConfig = {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    };

    // Make the devices request
    const devicesResponse = await axios.get(
      `https://api.connect.withsecure.com/devices/v1/devices?organizationId=${organizationId}`,
      devicesConfig
    );

    console.log("Devices response:", devicesResponse.data);

    // Step 3: Extract devices with AssetId in labels
    const devicesWithAssetIds = [];
    const assetIdMap = new Map();

    if (
      devicesResponse.data &&
      devicesResponse.data.items &&
      Array.isArray(devicesResponse.data.items)
    ) {
      for (const device of devicesResponse.data.items) {
        // Check if device has labels array
        if (device.labels && Array.isArray(device.labels)) {
          // Find AssetId label
          const assetIdLabel = device.labels.find((label) =>
            label.startsWith("AssetId:")
          );

          if (assetIdLabel) {
            // Extract AssetId value (format: "AssetId: \"HW-XXXXXXXX-XXX\"")
            const match = assetIdLabel.match(/AssetId: "([^"]+)"/);
            if (match && match[1]) {
              const assetId = match[1];
              devicesWithAssetIds.push({
                withSecureDevice: device,
                assetId: assetId,
              });
              assetIdMap.set(assetId, device);
            }
          }
        }
      }
    }

    // Step 4: Get hardware information for the asset IDs
    const Hardware = req.models.Hardware;
    const assetIds = Array.from(assetIdMap.keys());

    // If no devices with asset IDs found, return empty result
    if (assetIds.length === 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "No devices with valid asset IDs found",
        data: {
          devices: [],
          totalDevices: 0,
          numberOfPages: 0,
          currentPage: page,
        },
      });
    }

    // Find hardware assets by assetNumber (which should match the assetId)
    let hardwareQuery = { assetNumber: { $in: assetIds } };

    // Apply search query if provided
    if (searchQuery) {
      hardwareQuery = {
        $and: [
          hardwareQuery,
          {
            $or: [
              { assetName: { $regex: searchQuery, $options: "i" } },
              { assetType: { $regex: searchQuery, $options: "i" } },
              { department: { $regex: searchQuery, $options: "i" } },
              { location: { $regex: searchQuery, $options: "i" } },
              { assignedTo: { $regex: searchQuery, $options: "i" } },
              { assetNumber: { $regex: searchQuery, $options: "i" } },
            ],
          },
        ],
      };
    }

    // Get total count for pagination
    const totalHardware = await Hardware.countDocuments(hardwareQuery);

    // Apply pagination
    const skip = (page - 1) * limit;

    // Fetch hardware assets
    const hardwareAssets = await Hardware.find(hardwareQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Step 5: Combine WithSecure and hardware data
    const combinedDevices = hardwareAssets.map((hardware) => {
      const withSecureDevice = assetIdMap.get(hardware.assetNumber);

      return {
        id: hardware._id,
        deviceName: hardware.assetName,
        status: withSecureDevice
          ? withSecureDevice.protectionStatus
          : "unknown",
        operatingSystem:
          hardware.computerDetails?.os ||
          withSecureDevice?.os?.name ||
          "Unknown",
        assignedTo: hardware.assignedTo || "Unassigned",
        department: hardware.department || "Unassigned",
        location: hardware.location || "Unassigned",
        isSecured: withSecureDevice
          ? withSecureDevice.protectionStatus === "protected"
          : false,
        lastSeen: withSecureDevice
          ? withSecureDevice.statusUpdateTimestamp
          : null,
        withSecureId: withSecureDevice
          ? withSecureDevice.protectionStatus
          : null,
        online: withSecureDevice ? withSecureDevice.online : false,
        malwareState: withSecureDevice
          ? withSecureDevice.malwareState
          : "unknown",
      };
    });

    // Return the combined data with pagination info
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Devices found",
      data: {
        devices: combinedDevices,
        totalDevices: totalHardware,
        numberOfPages: Math.ceil(totalHardware / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching WithSecure devices:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error fetching WithSecure devices",
      error: error.message,
    });
  }
};
