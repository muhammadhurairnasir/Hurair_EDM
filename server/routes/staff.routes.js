import express from 'express';
import { getStaff, addStaff } from '../controllers/staff.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('restaurant_owner'));

router.route('/').get(getStaff).post(addStaff);

export default router;
