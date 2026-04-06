import express from 'express';
import { createPaymentIntent, createSaaSPaymentIntent } from '../controllers/payment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route — no auth needed for checkout
router.post('/create-payment-intent', createPaymentIntent);

// Protected B2B Route for Upgrades
router.post('/saas-payment-intent', protect, authorize('restaurant_owner'), createSaaSPaymentIntent);

export default router;
