import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { getCustomerCRM } from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('restaurant_owner'));

router.route('/').get(getDashboardStats);
router.route('/customers').get(getCustomerCRM);

export default router;
