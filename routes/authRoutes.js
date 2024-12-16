import express from "express";
const router = express.Router();
import { loginUser, logout } from "../controllers/authController.js";

router.route("/login").post(loginUser);
router.route("/logout").post(logout);

export default router;
