import express from 'express';
import { createOrder, getOrders, updateOrderStatus, createPublicOrder } from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { checkPlan } from '../middleware/subscription.middleware.js';

const router = express.Router();

router.post('/public', createPublicOrder);

router.use(protect);
router.use(authorize('restaurant_owner'));
router.use(checkPlan('orders'));

router.route('/').get(getOrders).post(createOrder);
router.route('/:id/status').put(updateOrderStatus);

export default router;
