import express from "express";
const router = express.Router();
import { verifyToken } from "../controllers/authController.js";

router.route("/users/token/verify").post(verifyToken);
export default router;
