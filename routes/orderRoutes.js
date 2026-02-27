import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  trackOrder,
} from "../controllers/orderController.js";
import auth from "../middleware/auth.js";
import { permissionCheck } from "../middleware/permissionCheck.js";
import validate from "../middleware/validate.js";
import validationSchemas from "../utils/validationSchemas.js";

const router = express.Router();

// Public routes
router.get("/track/:orderNumber", trackOrder);

// Protected routes (User)
router.post("/", auth, validate(validationSchemas.createOrder), createOrder);

router.get("/user/orders", auth, getUserOrders);
router.get("/:id", auth, getOrderById);
router.post("/:id/cancel", auth, cancelOrder);

// Admin routes (RBAC)
router.get("/", auth, permissionCheck("order.read"), getAllOrders);

router.put(
  "/:id/status",
  auth,
  permissionCheck("order.updateStatus"),
  updateOrderStatus,
);

router.put(
  "/:id/payment-status",
  auth,
  permissionCheck("order.updatePaymentStatus"),
  updatePaymentStatus,
);

export default router;
