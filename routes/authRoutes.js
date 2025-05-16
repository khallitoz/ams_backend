import express from "express";
const router = express.Router();
import { verifyToken } from "../controllers/authController.js";

router.get("/users/token/verify", verifyToken);

export default router;
