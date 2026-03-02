import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Get User Cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId }).populate(
      "items.productId",
    );

    if (!cart) {
      cart = await Cart.create({ userId: req.userId, items: [] });
    }

    res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

// Add Item to Cart
export async function addToCart(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const productInventory = await Inventory.findOne({ productId }).session(
      session,
    );

    if (!productInventory) {
      throw new Error("Product not found");
    }

    const availableStock =
      productInventory.total_stock - productInventory.reserved_stock;

    if (availableStock < quantity) {
      throw new Error("Insufficient stock");
    }

    // Atomic update
    productInventory.reserved_stock += quantity;
    await productInventory.save({ session });

    let cartItem = await Cart.findOne({ userId, productId }).session(session);

    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.reserved_until = new Date(Date.now() + 15 * 60 * 1000);
    } else {
      cartItem = new Cart({
        userId,
        productId,
        quantity,
        reserved_until: new Date(Date.now() + 15 * 60 * 1000),
      });
    }

    await cartItem.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({ message: "Item added to cart", cartItem });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: error.message });
  }
}

// Update Cart Item
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      throw new ApiError(400, "Quantity must be greater than 0");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.stock < quantity) {
      throw new ApiError(400, "Insufficient stock");
    }

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );
    if (!item) {
      throw new ApiError(404, "Item not found in cart");
    }

    item.quantity = quantity;
    calculateCartTotal(cart);
    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    res
      .status(200)
      .json(
        new ApiResponse(200, populatedCart, "Cart item updated successfully"),
      );
  } catch (error) {
    next(error);
  }
};

// Remove Item from Cart
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    calculateCartTotal(cart);
    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          populatedCart,
          "Item removed from cart successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

// Clear Cart
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.userId },
      { items: [], totalPrice: 0, totalDiscount: 0, couponDiscount: 0 },
      { new: true },
    );

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart cleared successfully"));
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate cart total
const calculateCartTotal = (cart) => {
  let totalPrice = 0;
  let totalDiscount = 0;

  cart.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    // Calculate discount if applicable
    // This is a placeholder - implement based on your discount logic
  });

  cart.totalPrice = totalPrice;
  cart.totalDiscount = totalDiscount;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
