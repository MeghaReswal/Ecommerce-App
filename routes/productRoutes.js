import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  searchProducts,
  addProductReview,
  getProductsByCategory,
} from "../controllers/productController.js";
import auth from "../middleware/auth.js";
import { permissionCheck } from "../middleware/permissionCheck.js";
import validate from "../middleware/validate.js";
import validationSchemas from "../utils/validationSchemas.js";

const router = express.Router();

// Public routes 
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

router.post("/:id/review", auth,
  permissionCheck("product.addReview"),
  addProductReview,
);

// Admin routes (RBAC)
router.post(
  "/",
  auth,
  permissionCheck("product.create"),
  validate(validationSchemas.createProduct),
  createProduct,
);

router.put(
  "/:id",
  auth,
  permissionCheck("product.update"),
  validate(validationSchemas.updateProduct),
  updateProduct,
);

router.delete("/:id", auth, permissionCheck("product.delete"), deleteProduct);

export default router;
