import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isProductInWishlist,
} from '../controllers/wishlistController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All wishlist routes require authentication
router.get('/', auth, getWishlist);
router.post('/items', auth, addToWishlist);
router.delete('/items/:productId', auth, removeFromWishlist);
router.delete('/', auth, clearWishlist);
router.get('/check/:productId', auth, isProductInWishlist);

export default router;
