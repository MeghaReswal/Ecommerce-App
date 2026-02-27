import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import validationSchemas from '../utils/validationSchemas.js';

const router = express.Router();

// All cart routes require authentication
router.get('/', auth, getCart);
router.post('/items', auth, validate(validationSchemas.addToCart), addToCart);
router.put('/items/:productId', auth, validate(validationSchemas.updateCartItem), updateCartItem);
router.delete('/items/:productId', auth, removeFromCart);
router.delete('/', auth, clearCart);

export default router;
