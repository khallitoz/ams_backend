import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import modelRegistry from "../db/ModelRegistry.js";
import { isValidDatabase, clearDbNamesCache } from "../db/connectDb.js";
import { MongoClient } from "mongodb";

export const verifyToken = async (req, res) => {
  try {
    // Extract token from cookies
    const token = req.cookies.auth_token || req.cookies.refresh_token;
    if (!token) {
      return res.status(401).json({
        valid: false,
        message: "No authentication token provided",
      });
    }

    // Verify token
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
        // Check if the client_id exists in the cache first
        if (!isValidDatabase(client_id)) {
          // Not in cache, so check directly if this specific database exists
          console.log(
            `Database ${client_id} not found in cache, checking directly...`
          );

          const baseUrl = process.env.MONGO_URI.substring(
            0,
            process.env.MONGO_URI.lastIndexOf("/")
          );
          const client = new MongoClient(`${baseUrl}/AMS?authSource=AMS`);

          try {
            await client.connect();
            console.log(
              `Connected to MongoDB to verify database: ${client_id}`
            );

            // Check using admin listDatabases
            const dbList = await client.db().admin().listDatabases();
            const dbNames = dbList.databases.map((db) => db.name);

            if (!dbNames.includes(client_id)) {
              console.log(`Database ${client_id} not found in database list`);
              return res.status(401).json({
                valid: false,
                message: "Invalid client database",
                redirect: "/auth/apps",
              });
            }

            // Database exists in the list - update cache
            const dbNamesCache = await import("../db/connectDb.js").then(
              (module) => module.dbNamesCache
            );
            if (dbNamesCache) {
              dbNames.forEach((name) => dbNamesCache.add(name));
              console.log(
                `Updated database cache with ${dbNames.length} databases`
              );
            }
          } finally {
            await client.close();
            console.log(
              `Closed MongoDB connection after database verification`
            );
          }
        }

        // If we got here, the database exists, so get models and proceed
        console.log(`Getting models for validated database: ${client_id}`);
        const models = await modelRegistry.getModels(
          client_id,
          process.env.MONGO_URI
        );

        // Store the client_id and models in the request object for later use
        req.client_id = client_id;
        req.models = models;

        // Extract display information from the token
        // Security: Only extract what's needed for UI display
        const displayInfo = {
          name:
            decoded.name ||
            decoded.user_name ||
            decoded.email?.split("@")[0] ||
            "User",
          email: decoded.email || "",
          role: decoded.role || "user",
        };

        // Return successful auth with minimal necessary information
        return res.status(200).json({
          valid: true,
          user: {
            // Only return what the frontend needs to know
            user_id: decoded.user_id || decoded.sub || decoded.id,
            role: decoded.role || "user",
            // Avoid including sensitive data from token
          },
          displayInfo: displayInfo,
        });
      } catch (dbError) {
        console.error(
          `Database connection error for client ${client_id}:`,
          dbError
        );
        return res.status(500).json({
          valid: false,
          message: "Error connecting to database",
          error: dbError.message,
          redirect: "/auth/apps",
        });
      }
    } else {
      return res.status(401).json({ valid: false });
    }
  } catch (error) {
    // Handle JWT verification errors specifically
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        valid: false,
        message: "Invalid token format",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        valid: false,
        message: "Token has expired",
        expired: true,
      });
    }

    // Generic error handler
    console.error("Token verification error:", error);
    return res.status(401).json({
      valid: false,
      message: "Authentication failed",
    });
  }
};
