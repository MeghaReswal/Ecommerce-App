import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Create Inventory (Admin)
 */
export const createInventory = async (req, res, next) => {
  try {
    const {
      productId,
      total_stock,
      reserved_stock = 0,
      price,
      backorder_allowed,
      low_stock_threshold,
    } = req.body;

    console.log("reqbody", req.body);

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Prevent duplicate inventory (productId is unique)
    const existingInventory = await Inventory.findOne({ productId });
    if (existingInventory) {
      throw new ApiError(400, "Inventory already exists for this product");
    }

    const inventory = await Inventory.create({
      productId,
      total_stock,
      reserved_stock,
      price,
      backorder_allowed,
      low_stock_threshold,
    });

    res
      .status(201)
      .json(new ApiResponse(201, inventory, "Inventory created successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Inventory by Product ID
 */
export const getInventoryByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const inventory = await Inventory.findOne({ productId }).populate(
      "productId",
      "name price",
    );

    if (!inventory) {
      throw new ApiError(404, "Inventory not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, inventory, "Inventory retrieved successfully"),
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Update Inventory (Restock / Price Update)
 */
export const updateInventory = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const inventory = await Inventory.findOneAndUpdate(
      { productId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!inventory) {
      throw new ApiError(404, "Inventory not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, inventory, "Inventory updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Inventory
 */
export const deleteInventory = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const inventory = await Inventory.findOneAndDelete({ productId });

    if (!inventory) {
      throw new ApiError(404, "Inventory not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, inventory, "Inventory deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export default {
  createInventory,
  getInventoryByProductId,
  updateInventory,
  deleteInventory,
};
