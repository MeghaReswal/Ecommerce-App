import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import { permissionCheck } from "../middleware/permissionCheck.js";
import validate from "../middleware/validate.js";
import validationSchemas from "../utils/validationSchemas.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validate(validationSchemas.registerUser),
  registerUser,
);
router.post("/login", validate(validationSchemas.loginUser), loginUser);
router.post("/verify-otp", validate(validationSchemas.verifyOTP), verifyOTP);

// Protected routes
router.get("/profile", auth, permissionCheck("user.read"), getUserProfile);
router.put(
  "/profile",
  auth,
  validate(validationSchemas.updateProfile),
  permissionCheck("user.update"),
  updateUserProfile,
);

router.post(
  "/change-password",
  auth,
  permissionCheck("user.changePassword"),
  changePassword,
);

export default router;
