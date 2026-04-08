import express from 'express';
import { toggleWishlist, getWishlist, getMyOrders, updateCustomerProfile } from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('customer')); // Only customers can have a wishlist and track personal orders

router.post('/wishlist', toggleWishlist);
router.get('/wishlist', getWishlist);
router.get('/orders', getMyOrders);
router.put('/profile', updateCustomerProfile);

export default router;
