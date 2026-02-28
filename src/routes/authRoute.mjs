import { Router } from "express";
import { login, signup, verifyEmail, verifyOtp, forgotPassword, verifyResetOtp, resetPassword, checkVerified } from "../controllers/authController.mjs";

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/verify-email/:token", verifyEmail);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/verify-reset-otp", verifyResetOtp);
authRoutes.post("/reset-password", resetPassword);
authRoutes.get("/check-verified", checkVerified);

export default authRoutes;
