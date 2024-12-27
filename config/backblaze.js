import B2 from "backblaze-b2";
import dotenv from "dotenv";

dotenv.config();

// Initialize Backblaze B2 with credentials from .env
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

let isAuthorized = false;

// Authorize Backblaze Function
const authorizeBackblaze = async () => {
  try {
    if (!isAuthorized) {
      await b2.authorize();
      isAuthorized = true;
      console.log(" Backblaze B2 Authorized Successfully");
    }
  } catch (error) {
    console.error(" Failed to authorize Backblaze B2:", error.message);
    throw new Error("Backblaze authorization failed. Check your credentials.");
  }
};

// Ensure Authorization Middleware
const ensureBackblazeAuthorization = async (req, res, next) => {
  try {
    if (!isAuthorized) {
      console.log("🔄 Re-authorizing Backblaze B2...");
      await authorizeBackblaze();
    }
    next();
  } catch (error) {
    console.error(" Backblaze Authorization Middleware Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to authorize Backblaze B2",
      error: error.message,
    });
  }
};

// Get Upload URL and Authorization Token
const getUploadUrl = async () => {
  try {
    await authorizeBackblaze(); // Ensure authorized before fetching the URL

    const response = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });

    const { uploadUrl, authorizationToken } = response.data;
    console.log(" Successfully retrieved upload URL and token");
    return { uploadUrl, authorizationToken };
  } catch (error) {
    console.error(" Failed to get Backblaze upload URL:", error.message);
    if (error.message.includes("Invalid authorizationToken")) {
      console.log(" Token invalid, re-authorizing...");
      await authorizeBackblaze();
      return await getUploadUrl(); // Retry once after re-authorization
    }
    throw new Error("Failed to get Backblaze upload URL.");
  }
};

export { b2, authorizeBackblaze, ensureBackblazeAuthorization, getUploadUrl };
