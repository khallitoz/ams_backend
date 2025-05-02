import { StatusCodes } from "http-status-codes";
import modelRegistry from "../db/ModelRegistry.js";
import { getConnections } from "../db/connectDb.js";

/**
 * Middleware factory that wraps controller functions to ensure models are available
 * @param {Function} controller - The controller function to wrap
 * @returns {Function} - Middleware function that injects models into the request
 */
const withModels = (controller) => {
  return async (req, res, next) => {
    try {
      // Check if client_id is available in the request
      if (!req.client_id) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Client ID not found in request",
        });
      }

      // Check if we have models in the registry
      if (modelRegistry.hasModels(req.client_id)) {
        // Check if the connection is still active
        const connections = getConnections();
        const clientConnection = connections.find(
          (conn) => conn.key === req.client_id
        );

        // If connection is not active, clear models and get new ones
        if (!clientConnection || clientConnection.connectionState !== 1) {
          console.log(
            `Connection for client ${req.client_id} is not active, getting new models`
          );
          modelRegistry.clearClientModels(req.client_id);
        }
      }

      // Get models from the registry using the client_id
      const models = await modelRegistry.getModels(
        req.client_id,
        process.env.MONGO_URI
      );

      // Attach models to the request object
      req.models = models;

      // Call the controller function with the updated request
      return controller(req, res, next);
    } catch (error) {
      console.error("Error in withModels middleware:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error accessing database models",
        error: error.message,
      });
    }
  };
};

export default withModels;
