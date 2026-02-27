import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import auth from "../middleware/auth.js";
import { permissionCheck } from "../middleware/permissionCheck.js";
import validate from "../middleware/validate.js";
import validationSchemas from "../utils/validationSchemas.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategoryById);

// Protected routes (RBAC)
router.post(
  "/",
  auth,
  permissionCheck("category.create"),
  validate(validationSchemas.createCategory),
  createCategory,
);

router.put(
  "/:id",
  auth,
  permissionCheck("category.update"),
  validate(validationSchemas.createCategory),
  updateCategory,
);

router.delete("/:id", auth, permissionCheck("category.delete"), deleteCategory);

export default router;
