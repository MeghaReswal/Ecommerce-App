import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import validationSchemas from "../utils/validationSchemas.js";
import { permissionCheck } from "../middleware/permissionCheck.js";

const router = express.Router();

// Protected routes
router.get("/profile", auth, getUserProfile);
router.put(
  "/profile",
  auth,
  validate(validationSchemas.updateProfile),
  updateUserProfile,
);
router.delete("/account", auth, deleteUserAccount);

// Admin routes
router.get("/", auth, permissionCheck("user.read"), getAllUsers);
router.get("/:id", auth, permissionCheck("user.read"), getUserById);
router.put(
  "/:id/role",
  auth,
  permissionCheck("user.updateRole"),
  updateUserRole,
);
router.put(
  "/:id/deactivate",
  auth,
  permissionCheck("user.deactivate"),
  deactivateUser,
);

export default router;
