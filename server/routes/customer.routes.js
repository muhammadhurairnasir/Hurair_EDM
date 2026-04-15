import express from 'express';
import { toggleWishlist, getWishlist, getMyOrders, updateCustomerProfile, submitReview } from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('customer'));

router.post('/wishlist', toggleWishlist);
router.get('/wishlist', getWishlist);
router.get('/orders', getMyOrders);
router.put('/profile', updateCustomerProfile);
router.post('/review', submitReview);

export default router;

