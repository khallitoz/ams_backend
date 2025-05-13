import axios from "axios";
import { StatusCodes } from "http-status-codes";

export const fetchSingleDevice = async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Device ID is required",
      });
    }

    // Get hardware information first
    const Hardware = req.models.Hardware;
    const hardwareDevice = await Hardware.findById(deviceId);

    if (!hardwareDevice) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Device not found",
      });
    }

    // Check if the device has an asset number to fetch from WithSecure
    if (!hardwareDevice.assetNumber) {
      // Return just the hardware data if no asset number
      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          id: hardwareDevice._id,
          deviceName: hardwareDevice.assetName,
          assignedTo: hardwareDevice.assignedTo || "Unassigned",
          department: hardwareDevice.department || "Unassigned",
          location: hardwareDevice.location || "Unassigned",
          notes: hardwareDevice.description || "",
          operatingSystem: hardwareDevice.computerDetails?.os || "Unknown",
          isProtected: false,
          isEncrypted: false,
          status: hardwareDevice.checkoutstatus?.[0] || "InActive",
          systemStorage: "Unknown",
          specs: {
            serialNumber: hardwareDevice.serialNo || "Unknown",
            macAddress: "Unknown",
            memory: hardwareDevice.computerDetails?.memory || "Unknown",
            processor: hardwareDevice.computerDetails?.processor || "Unknown",
            operatingSystem: hardwareDevice.computerDetails?.os || "Unknown",
            lastScan: "Unknown",
            ipAddress: hardwareDevice.computerDetails?.ipAddress || "Unknown",
          },
        },
      });
    }

    // Step 1: Get the access token for WithSecure API
    const client = process.env.WITHSECURE_CLIENT_ID;
    const secret = process.env.WITHSECURE_CLIENT_SECRET;
    const organizationId = process.env.WITHSECURE_ORGANISATIONID;

    if (!client || !secret || !organizationId) {
      console.error(
        "Missing required environment variables for WithSecure API"
      );

      // Return hardware data only if WithSecure credentials are missing
      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          id: hardwareDevice._id,
          deviceName: hardwareDevice.assetName,
          assignedTo: hardwareDevice.assignedTo || "Unassigned",
          department: hardwareDevice.department || "Unassigned",
          location: hardwareDevice.location || "Unassigned",
          notes: hardwareDevice.description || "",
          operatingSystem: hardwareDevice.computerDetails?.os || "Unknown",
          isProtected: false,
          isEncrypted: false,
          status: hardwareDevice.checkoutstatus?.[0] || "InActive",
          systemStorage: "Unknown",
          specs: {
            serialNumber: hardwareDevice.serialNo || "Unknown",
            macAddress: "Unknown",
            memory: hardwareDevice.computerDetails?.memory || "Unknown",
            processor: hardwareDevice.computerDetails?.processor || "Unknown",
            operatingSystem: hardwareDevice.computerDetails?.os || "Unknown",
            lastScan: "Unknown",
            ipAddress: hardwareDevice.computerDetails?.ipAddress || "Unknown",
          },
        },
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

    // Find the device with matching asset number in the labels
    let withSecureDevice = null;

    if (
      devicesResponse.data &&
      devicesResponse.data.items &&
      Array.isArray(devicesResponse.data.items)
    ) {
      for (const device of devicesResponse.data.items) {
        if (device.labels && Array.isArray(device.labels)) {
          const assetIdLabel = device.labels.find((label) =>
            label.startsWith("AssetId:")
          );

          if (assetIdLabel) {
            const match = assetIdLabel.match(/AssetId: "([^"]+)"/);
            if (match && match[1] === hardwareDevice.assetNumber) {
              withSecureDevice = device;
              break;
            }
          }
        }
      }
    }

    // If no matching WithSecure device found, return hardware data only
    if (!withSecureDevice) {
      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          id: hardwareDevice._id,
          deviceName: hardwareDevice.assetName,
          assignedTo: hardwareDevice.assignedTo || "Unassigned",
          department: hardwareDevice.department || "Unassigned",
          location: hardwareDevice.location || "Unassigned",
          notes: hardwareDevice.description || "",
          operatingSystem: hardwareDevice.computerDetails?.os || "Unknown",
          isProtected: false,
          isEncrypted: false,
          status: hardwareDevice.checkoutstatus?.[0] || "InActive",
          systemStorage: "Unknown",
          specs: {
            serialNumber: hardwareDevice.serialNo || "Unknown",
            macAddress: "Unknown",
            memory: hardwareDevice.computerDetails?.memory || "Unknown",
            processor: hardwareDevice.computerDetails?.processor || "Unknown",
            operatingSystem: hardwareDevice.computerDetails?.os || "Unknown",
            lastScan: "Unknown",
            ipAddress: hardwareDevice.computerDetails?.ipAddress || "Unknown",
          },
        },
      });
    }

    // Calculate storage in GB
    const totalStorageGB = (
      withSecureDevice.systemDriveTotalSize /
      (1024 * 1024 * 1024)
    ).toFixed(2);
    const freeStorageGB = (
      withSecureDevice.systemDriveFreeSpace /
      (1024 * 1024 * 1024)
    ).toFixed(2);
    const usedStorageGB = (totalStorageGB - freeStorageGB).toFixed(2);

    // Calculate memory in GB
    const totalMemoryGB = (
      withSecureDevice.physicalMemoryTotalSize /
      (1024 * 1024 * 1024)
    ).toFixed(2);
    const freeMemoryGB = (
      withSecureDevice.physicalMemoryFree /
      (1024 * 1024 * 1024)
    ).toFixed(2);

    // Format storage string
    const storageString = `${usedStorageGB} GB of ${totalStorageGB} GB used`;

    // Combine data from both sources
    const combinedData = {
      id: hardwareDevice._id,
      deviceName: hardwareDevice.assetName,
      assignedTo: hardwareDevice.assignedTo || "Unassigned",
      department: hardwareDevice.department || "Unassigned",
      location: hardwareDevice.location || "Unassigned",
      notes: hardwareDevice.description || "",
      operatingSystem:
        hardwareDevice.computerDetails?.os ||
        withSecureDevice.os?.name ||
        "Unknown",
      isProtected: withSecureDevice.protectionStatus === "protected",
      isEncrypted: withSecureDevice.discEncryptionEnabled || false,
      status:
        withSecureDevice.state ||
        hardwareDevice.checkoutstatus?.[0] ||
        "InActive",
      systemStorage: storageString,
      online: withSecureDevice.online || false,
      securityInfo: {
        malwareState: withSecureDevice.malwareState || "unknown",
        protectionStatusOverview:
          withSecureDevice.protectionStatusOverview || "unknown",
        lastScan: withSecureDevice.patchLastScanTimestamp || "Unknown",
      },
      specs: {
        serialNumber:
          withSecureDevice.serialNumber || hardwareDevice.serialNo || "Unknown",
        macAddress: withSecureDevice.macAddresses || "Unknown",
        memory: `${totalMemoryGB} GB (${freeMemoryGB} GB free)`,
        processor: hardwareDevice.computerDetails?.processor || "Unknown",
        operatingSystem:
          hardwareDevice.computerDetails?.os ||
          withSecureDevice.os?.name ||
          "Unknown",
        lastScan: withSecureDevice.patchLastScanTimestamp || "Unknown",
        ipAddress:
          withSecureDevice.ipAddresses ||
          hardwareDevice.computerDetails?.ipAddress ||
          "Unknown",
      },
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data: combinedData,
    });
  } catch (error) {
    console.error("Error fetching device details:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error fetching device details",
      error: error.message,
    });
  }
};
