import express from 'express';
import { createOrder, getOrders, updateOrder, createPublicOrder } from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/public', createPublicOrder);

router.use(protect);
router.use(authorize('restaurant_owner'));

router.route('/').get(getOrders).post(createOrder);
router.route('/:id').put(updateOrder);

export default router;
