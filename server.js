import express from "express";
import dotenv from "dotenv";

import morgan from "morgan";
import "express-async-errors";
import { closeAllConnections, getConnections } from "./db/connectDb.js";
import modelRegistry from "./db/ModelRegistry.js";

import amsservicesRouter from "./routes/amsserviceRoutes.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import { authorizeBackblaze } from "./config/backblaze.js";

import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import locationRouter from "./routes/locationRoutes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT_NO; // Use a default port if PORT_NO is not defined

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:4502",
    "http://localhost:4500",
    "http://localhost:3500",
  ], // Allow these origins
  credentials: true, // Allow cookies and credentials
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Supported HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb", extended: true }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); // Logging in non-production environments
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.static("./public")); // Serve static files
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/amsservices", amsservicesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/locations", locationRouter);

app.use(errorHandlerMiddleware);

// Server status endpoint
app.get("/api/v1/status", (req, res) => {
  res.json({
    status: "ok",
    connections: modelRegistry.getStats(),
  });
});

// Debug endpoint
app.get("/api/v1/debug/connections", (req, res) => {
  const connectionDetails = getConnections();

  res.json({
    totalConnections: connectionDetails.length,
    connections: connectionDetails,
  });
});

// Start Server
const start = async () => {
  try {
    await authorizeBackblaze();
    console.log(" Backblaze B2 Authorized on Server Startup");

    const server = app.listen(PORT, () =>
      console.log(` Server is running on http://localhost:${PORT}`)
    );

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down gracefully");

      // Clear the model registry
      modelRegistry.clear();

      // Close all existing database connections
      await closeAllConnections();

      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    };

    // Handle different shutdown signals
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error(" Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
