import express from 'express';
import { getSubscription, updateSubscription } from '../controllers/subscription.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('restaurant_owner'));

router.route('/').get(getSubscription).put(updateSubscription);

export default router;
