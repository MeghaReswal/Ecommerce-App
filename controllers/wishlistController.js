import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// Get User Wishlist
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.userId }).populate('products.productId');

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.userId, products: [] });
    }

    res.status(200).json(
      new ApiResponse(200, wishlist, 'Wishlist retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Add Product to Wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.userId, products: [] });
    }

    // Check if product already in wishlist
    const alreadyExists = wishlist.products.find(
      (item) => item.productId.toString() === productId
    );

    if (alreadyExists) {
      throw new ApiError(400, 'Product already in wishlist');
    }

    // Add product to wishlist
    wishlist.products.push({ productId });
    await wishlist.save();

    const populatedWishlist = await wishlist.populate('products.productId');

    res.status(200).json(
      new ApiResponse(200, populatedWishlist, 'Product added to wishlist successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Remove Product from Wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      throw new ApiError(404, 'Wishlist not found');
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();

    const populatedWishlist = await wishlist.populate('products.productId');

    res.status(200).json(
      new ApiResponse(200, populatedWishlist, 'Product removed from wishlist successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Clear Wishlist
export const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.userId },
      { products: [] },
      { new: true }
    );

    if (!wishlist) {
      throw new ApiError(404, 'Wishlist not found');
    }

    res.status(200).json(
      new ApiResponse(200, wishlist, 'Wishlist cleared successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Check if Product in Wishlist
export const isProductInWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.userId });

    if (!wishlist) {
      return res.status(200).json(
        new ApiResponse(200, { inWishlist: false }, 'Product not in wishlist')
      );
    }

    const inWishlist = wishlist.products.some(
      (item) => item.productId.toString() === productId
    );

    res.status(200).json(
      new ApiResponse(200, { inWishlist }, 'Wishlist check completed')
    );
  } catch (error) {
    next(error);
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isProductInWishlist,
};
