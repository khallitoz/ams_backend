import express from "express";
import dotenv from "dotenv";

import morgan from "morgan";
import "express-async-errors";
import connectDb from "./db/connectDb.js";

import amsservicesRouter from "./routes/amsserviceRoutes.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import { authorizeBackblaze } from "./config/backblaze.js";

import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT_NO; // Use a default port if PORT_NO is not defined

// CORS Configuration
const corsOptions = {
  origin: "*", // Allow requests from the frontend
  credentials: true, // Allow cookies and credentials
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Supported HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS
app.options("*", cors(corsOptions)); // Handle preflight requests
app.use(express.json({ limit: "10mb", extended: true }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); // Logging in non-production environments
}

app.use(express.static("./public")); // Serve static files
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/amsservices", amsservicesRouter);

app.use(errorHandlerMiddleware);

// Start Server
const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await authorizeBackblaze();
    console.log(" Backblaze B2 Authorized on Server Startup");

    app.listen(PORT, () =>
      console.log(` Server is running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error(" Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
