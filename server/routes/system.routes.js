import express from 'express';
import { getSystemStats, getAllRestaurantsSubscriptions, forceUpdateSubscription } from '../controllers/system.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('system_admin'));

router.get('/stats', getSystemStats);
router.get('/subscriptions', getAllRestaurantsSubscriptions);
router.put('/subscriptions/:subscriptionId', forceUpdateSubscription);

export default router;
