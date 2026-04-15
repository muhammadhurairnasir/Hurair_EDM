import express from 'express';
import { getCoupons, createCoupon, deleteCoupon, verifyPublicCoupon } from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route for storefront to verify coupons
router.post('/public/verify/:restaurantId', verifyPublicCoupon);

// Protected routes for restaurant owner
router.use(protect);

router.route('/')
  .get(getCoupons)
  .post(authorize('restaurant_owner'), createCoupon);

router.route('/:id')
  .delete(authorize('restaurant_owner'), deleteCoupon);

export default router;
