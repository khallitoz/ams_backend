import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import connectDb from "../db/connectDb.js";
import { getConnections } from "../db/connectDb.js";
import modelRegistry from "../db/ModelRegistry.js";

/**
 * Middleware to extract client ID from token and attach it to the request
 * This middleware should be used before withModels middleware
 */
const dbConnection = async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const token = req.cookies.auth_token || req.cookies.refresh_token;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token and extract client_id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract client_id from token (try different possible field names)
    const client_id = decoded.client_id || decoded.tenant_id || decoded.userId;

    if (!client_id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No client ID found in token",
      });
    }

    // Attach client_id to request object
    req.client_id = client_id;

    // Check if a connection exists for this client
    const connections = getConnections();
    const clientConnection = connections.find((conn) => conn.key === client_id);

    // If no connection exists or the connection is not in a connected state, create a new one
    if (!clientConnection || clientConnection.connectionState !== 1) {
      console.log(
        `No active connection found for client ${client_id}, creating a new one`
      );

      // Clear any stale models for this client from the model registry
      modelRegistry.clearClientModels(client_id);

      try {
        // Create a new connection
        const { connection, models } = await connectDb(
          process.env.MONGO_URI,
          client_id
        );

        // Store models in the registry
        modelRegistry.setModels(client_id, models);

        console.log(
          `Successfully created new connection for client ${client_id}`
        );
      } catch (error) {
        console.error(
          `Error creating connection for client ${client_id}:`,
          error
        );
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Failed to establish database connection",
          error: error.message,
        });
      }
    } else {
      console.log(`Using existing connection for client ${client_id}`);
    }

    next();
  } catch (error) {
    console.error("Error in dbConnection middleware:", error);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

export default dbConnection;
