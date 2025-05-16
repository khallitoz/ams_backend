import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcryptjs from "bcryptjs";
import modelRegistry from "./ModelRegistry.js";
import { MongoClient } from "mongodb";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsDir = path.join(__dirname, "..", "models");

// Import schemas
import HardwareSchema from "../models/schemas/HardwareSchema.js";
import SoftwareSchema from "../models/schemas/SoftwareSchema.js";
import InstallSoftwareSchema from "../models/schemas/InstallSoftwareSchema.js";
import AssignedAssetSchema from "../models/schemas/AssignedAssetSchema.js";
import CounterSchema from "../models/schemas/CounterSchema.js";
import UserSchema from "../models/schemas/UserSchema.js";
import MaintenanceSchema from "../models/schemas/MaintenanceSchema.js";
import LocationSchema from "../models/schemas/LocationSchema.js";
import EmployeeSchema from "../models/schemas/EmployeeSchema.js";

// Map to store active connections and their models
const connections = new Map();
// Simple cache for database names
const dbNamesCache = new Set();
// Timeout for inactive connections (in milliseconds)
const CONNECTION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Creates all the models for a specific connection
 */
const createModels = async (connection) => {
  // Define models with their schemas
  const models = {
    Counter: connection.model("Counter", CounterSchema),
    Hardware: connection.model("Hardware", HardwareSchema),
    AllSoftwares: connection.model("AllSoftwares", SoftwareSchema),
    InstallSoftware: connection.model("InstallSoftware", InstallSoftwareSchema),
    AssignedAsset: connection.model("AssignedAsset", AssignedAssetSchema),
    User: connection.model("User", UserSchema),
    Maintenance: connection.model("Maintenance", MaintenanceSchema),
    Location: connection.model("Location", LocationSchema),
    Employee: connection.model("Employee", EmployeeSchema),
  };

  return models;
};

/**
 * Connects to a database based on client_id
 * Manages multiple concurrent connections with timeout for inactive ones
 * Creates and returns models specific to the connection
 */
const connectDb = async (url, client_id = null) => {
  // Generate a connection key - use the client_id or 'default' if none provided
  const connectionKey = client_id || "default";

  // Check if we already have an active connection for this client
  if (connections.has(connectionKey)) {
    const connectionData = connections.get(connectionKey);

    // Reset the timeout for this connection since it's being used
    clearTimeout(connectionData.timeoutId);

    // Set a new timeout
    const timeoutId = setTimeout(() => {
      // Close this connection if it becomes inactive
      closeConnection(connectionKey);
    }, CONNECTION_TIMEOUT);

    // Update the connection data with the new timeout
    connections.set(connectionKey, {
      ...connectionData,
      timeoutId,
      lastUsed: Date.now(),
    });

    console.log(`Using existing connection to database: ${connectionKey}`);
    return {
      connection: connectionData.connection,
      models: connectionData.models,
    };
  }

  // If we don't have a connection for this client, create a new one
  try {
    // Build the connection string
    let connectionString = url;

    if (client_id) {
      // Extract the base connection string (everything before the database name)
      const baseUrl = url.substring(0, url.lastIndexOf("/"));
      // Create a new connection string with the client_id as the database name
      connectionString = `${baseUrl}/${client_id}?authSource=AMS`;
    }

    console.log(`Creating new connection to database: ${connectionKey}`);
    const baseUrl = url.substring(0, url.lastIndexOf("/"));

    // Check if client_id is in the cache
    if (!dbNamesCache.has(client_id)) {
      // If not in cache, get the list of databases
      const client = new MongoClient(`${baseUrl}/AMS?authSource=AMS`);
      try {
        await client.connect();
        const db = client.db(client_id);
        const dbList = await client.db().admin().listDatabases();
        const dbNames = dbList.databases.map((db) => db.name);

        // Add all database names to the cache
        dbNames.forEach((name) => dbNamesCache.add(name));
        console.log(
          `Updated database names cache with ${dbNames.length} databases`
        );
      } finally {
        // Ensure the client is closed to prevent connection leaks
        await client.close();
        console.log("Closed temporary MongoDB client connection");
      }
    }

    //Check to see if client_id is in the list of databases
    if (!dbNamesCache.has(client_id)) {
      console.log(`Database ${client_id} not found in the list of databases`);
      throw new Error(
        `Database ${client_id} not found in the list of databases`
      );
    }

    // Create a new mongoose connection
    const connection = mongoose.createConnection(connectionString);

    // Create models for this connection
    const models = await createModels(connection);

    // Set a timeout to close the connection if it becomes inactive
    const timeoutId = setTimeout(() => {
      closeConnection(connectionKey);
    }, CONNECTION_TIMEOUT);

    // Store the connection and models in the map
    connections.set(connectionKey, {
      connection,
      models,
      timeoutId,
      lastUsed: Date.now(),
    });

    // Return both the connection and models
    return {
      connection,
      models,
    };
  } catch (error) {
    console.error(`Error connecting to database ${connectionKey}:`, error);
    throw error;
  }
};

/**
 * Closes a specific connection and removes it from the map
 */
const closeConnection = async (connectionKey) => {
  if (connections.has(connectionKey)) {
    const connectionData = connections.get(connectionKey);

    try {
      // Clear the timeout
      clearTimeout(connectionData.timeoutId);

      // Log the model cache before deletion
      if (connectionData.models) {
        console.log(
          `Model cache before deletion for connection ${connectionKey}:`
        );
        Object.values(connectionData.models).forEach((model) => {
          if (
            model.collection &&
            model.collection.conn &&
            model.collection.conn.models
          ) {
            console.log(
              `- Model: ${model.modelName}, Cache keys: ${Object.keys(
                model.collection.conn.models
              ).join(", ")}`
            );
          }
        });

        // Clear the model cache for this specific connection only
        Object.values(connectionData.models).forEach((model) => {
          // Clear only this model from this connection's cache
          if (
            model.collection &&
            model.collection.conn &&
            model.collection.conn.models
          ) {
            delete model.collection.conn.models[model.modelName];
          }
        });

        // Log the model cache after deletion
        console.log(
          `Model cache after deletion for connection ${connectionKey}:`
        );
        Object.values(connectionData.models).forEach((model) => {
          if (
            model.collection &&
            model.collection.conn &&
            model.collection.conn.models
          ) {
            console.log(
              `- Model: ${model.modelName}, Cache keys: ${Object.keys(
                model.collection.conn.models
              ).join(", ")}`
            );
          }
        });
      }

      // Clear models from the registry
      modelRegistry.clearClientModels(connectionKey);

      // Close the connection
      await connectionData.connection.close();
      console.log(`Closed inactive connection to database: ${connectionKey}`);
    } catch (error) {
      console.error(`Error closing connection to ${connectionKey}:`, error);
    } finally {
      // Remove the connection from the map
      connections.delete(connectionKey);
      console.log(`Removed connection from map: ${connectionKey}`);
    }
  }
};

/**
 * Closes all active connections
 * Useful when shutting down the server
 */
export const closeAllConnections = async () => {
  for (const [connectionKey, connectionData] of connections.entries()) {
    try {
      // Clear the timeout
      clearTimeout(connectionData.timeoutId);

      // Close the connection
      await connectionData.connection.close();
      console.log(`Closed connection to database: ${connectionKey}`);
    } catch (error) {
      console.error(`Error closing connection to ${connectionKey}:`, error);
    }
  }

  // Clear the connections map
  connections.clear();
};

// Export the getConnections function
export const getConnections = () => {
  return Array.from(connections.entries()).map(([key, value]) => ({
    key,
    connectionState: value.connection.readyState,
    lastUsed: value.lastUsed,
  }));
};

/**
 * Checks if a database exists using the cache
 * @param {string} client_id - The client ID to check
 * @returns {boolean} - Whether the database exists
 */
export const isValidDatabase = (client_id) => {
  if (!client_id) return false;
  return dbNamesCache.has(client_id);
};

/**
 * Ensures database names are loaded in the cache
 * @param {string} url - MongoDB connection URL
 * @param {boolean} forceRefresh - Whether to force a refresh of the cache
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const ensureDatabaseNamesLoaded = async (url, forceRefresh = false) => {
  // If cache is empty or force refresh is requested, populate it
  if (dbNamesCache.size === 0 || forceRefresh) {
    const baseUrl = url.substring(0, url.lastIndexOf("/"));
    const client = new MongoClient(`${baseUrl}/AMS?authSource=AMS`);
    try {
      await client.connect();
      const dbList = await client.db().admin().listDatabases();
      const dbNames = dbList.databases.map((db) => db.name);

      // Clear cache if refreshing
      if (forceRefresh && dbNamesCache.size > 0) {
        dbNamesCache.clear();
      }

      // Add all names to cache
      dbNames.forEach((name) => dbNamesCache.add(name));

      const action = forceRefresh ? "Refreshed" : "Preloaded";
      console.log(`${action} ${dbNames.length} database names into cache`);
      return true;
    } catch (error) {
      console.error("Error loading database names:", error);
      throw error;
    } finally {
      await client.close();
      console.log("Closed temporary MongoDB client connection");
    }
  }
  return true;
};

// Helper function to refresh the database names cache periodically
let cacheRefreshInterval = null;

/**
 * Starts periodic refresh of database names cache
 * @param {string} url - MongoDB connection URL
 * @param {number} intervalMs - Refresh interval in milliseconds (default: 1 hour)
 */
export const startPeriodicCacheRefresh = (url, intervalMs = 60 * 60 * 1000) => {
  // Clear any existing interval
  if (cacheRefreshInterval) {
    clearInterval(cacheRefreshInterval);
  }

  // Set up new interval
  cacheRefreshInterval = setInterval(async () => {
    try {
      console.log("Performing scheduled refresh of database names cache");
      await ensureDatabaseNamesLoaded(url, true);
    } catch (error) {
      console.error("Error during scheduled cache refresh:", error);
    }
  }, intervalMs);

  console.log(
    `Database names cache will refresh every ${intervalMs / 60000} minutes`
  );
  return true;
};

/**
 * Stops periodic refresh of database names cache
 */
export const stopPeriodicCacheRefresh = () => {
  if (cacheRefreshInterval) {
    clearInterval(cacheRefreshInterval);
    cacheRefreshInterval = null;
    console.log("Stopped periodic database names cache refresh");
  }
};

/**
 * Clears the database names cache
 */
export const clearDbNamesCache = () => {
  dbNamesCache.clear();
  console.log("Cleared database names cache");
};

// Export the default connectDb function
export default connectDb;
