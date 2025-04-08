import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import modelRegistry from "../db/ModelRegistry.js";

export const verifyToken = async (req, res) => {
  try {
    // Get token from cookies or bearer token in header
    const token =
      req.cookies.auth_token ||
      req.body.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      // Extract client_id from the token
      const client_id =
        decoded.client_id || decoded.tenant_id || decoded.userId;

      if (!client_id) {
        return res.status(401).json({
          valid: false,
          message: "No client_id found in token",
        });
      }

      try {
        // Get the models for this client from the registry
        // This will reuse existing models or create new ones if needed
        const models = await modelRegistry.getModels(
          client_id,
          process.env.MONGO_URI
        );

        // Store the client_id and models in the request object for later use
        req.client_id = client_id;
        req.models = models;

        return res.status(200).json({
          valid: true,
          user: decoded,
        });
      } catch (dbError) {
        console.error("Database connection error:", dbError);
        return res.status(500).json({
          valid: false,
          message: "Error connecting to database",
          error: dbError.message,
        });
      }
    } else {
      return res.status(401).json({ valid: false });
    }
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
};
