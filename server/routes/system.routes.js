import express from 'express';
import { getSystemStats } from '../controllers/system.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('system_admin'));

router.get('/stats', getSystemStats);

export default router;
