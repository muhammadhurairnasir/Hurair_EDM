import express from 'express';
import { getCoupons, createCoupon, deleteCoupon } from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCoupons)
  .post(authorize('restaurant_owner'), createCoupon);

router.route('/:id')
  .delete(authorize('restaurant_owner'), deleteCoupon);

export default router;
