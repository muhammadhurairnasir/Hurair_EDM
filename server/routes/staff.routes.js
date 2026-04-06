import express from 'express';
import { getStaff, addStaff } from '../controllers/staff.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { checkPlan } from '../middleware/subscription.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('restaurant_owner'));
router.use(checkPlan('staff'));

router.route('/').get(getStaff).post(addStaff);

export default router;
