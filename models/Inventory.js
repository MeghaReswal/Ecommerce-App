import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    total_stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reserved_stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    // optional fields for advanced features
    backorder_allowed: {
      type: Boolean,
      default: false,
    },
    low_stock_threshold: {
      type: Number,
      default: 5, // can trigger notification
    },
  },
  {
    timestamps: true,
  },
);

// Virtual field for available stock
inventorySchema.virtual("available_stock").get(function () {
  return this.total_stock - this.reserved_stock;
});

// Indexes for fast lookups
inventorySchema.index({ productId: 1 });
inventorySchema.index({ warehouseId: 1, productId: 1 });

export default mongoose.model("Inventory", inventorySchema);
