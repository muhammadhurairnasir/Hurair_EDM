import express from 'express';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, getPublicMenu, resolveStoreSlug, getPublicMenuItemBySlug } from '../controllers/menu.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { checkPlan } from '../middleware/subscription.middleware.js';

const router = express.Router();

router.get('/public/:restaurantId', getPublicMenu);
router.get('/public/store/resolve/:slug', resolveStoreSlug);
router.get('/public/store/:slug/item/:productSlug', getPublicMenuItemBySlug);

router.use(protect);
router.use(authorize('restaurant_owner'));
router.use(checkPlan('menu'));

router.route('/').get(getMenu).post(addMenuItem);
router.route('/:id').put(updateMenuItem).delete(deleteMenuItem);

export default router;
