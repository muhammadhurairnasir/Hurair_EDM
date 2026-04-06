import express from 'express';
import { toggleWishlist, getWishlist, getMyOrders } from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('customer')); // Only customers can have a wishlist and track personal orders

router.route('/wishlist').get(getWishlist).post(toggleWishlist);
router.route('/orders').get(getMyOrders);

export default router;
