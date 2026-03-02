import express from "express";
import {
  createInventory,
  getInventoryByProductId,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

import auth from "../middleware/auth.js";
import { permissionCheck } from "../middleware/permissionCheck.js";
import validate from "../middleware/validate.js";
import validationSchemas from "../utils/validationSchemas.js";

const router = express.Router();

router.post(
  "/",
  auth,
  permissionCheck("inventory.create"),
  validate(validationSchemas.createInventory),
  createInventory,
);

// Get inventory by inventory
router.get(
  "/:productId",
  auth,
  // permissionCheck("inventory.view"),
  getInventoryByProductId,
);

// Update inventory (restock, change price, etc.)
router.patch(
  "/:productId",
  auth,
  permissionCheck("inventory.update"),
  validate(validationSchemas.updateInventory),
  updateInventory,
);

// Delete inventory (if inventory removed)
router.delete(
  "/:productId",
  auth,
  permissionCheck("inventory.delete"),
  deleteInventory,
);

export default router;
