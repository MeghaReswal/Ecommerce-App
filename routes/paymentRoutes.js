import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  createRazorpayPaymentIntent,
  verifyRazorpayPayment,
} from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Stripe payment routes
router.post('/stripe/create-payment-intent', auth, createPaymentIntent);
router.post('/stripe/confirm-payment', auth, confirmPayment);
router.get('/stripe/:paymentIntentId', auth, getPaymentStatus);

// Razorpay payment routes (Alternative)
router.post('/razorpay/create-payment-intent', auth, createRazorpayPaymentIntent);
router.post('/razorpay/verify-payment', auth, verifyRazorpayPayment);

export default router;
