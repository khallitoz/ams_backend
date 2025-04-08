import { StatusCodes } from "http-status-codes";
import modelRegistry from "../db/ModelRegistry.js";

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
