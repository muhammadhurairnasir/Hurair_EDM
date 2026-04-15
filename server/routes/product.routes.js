import express from 'express';
import { getProducts, addProduct, updateProduct, deleteProduct, getPublicProducts, resolveStoreSlug, getPublicProductBySlug } from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes — no auth required
router.get('/public/store/resolve/:slug', resolveStoreSlug);
router.get('/public/store/:slug/item/:productSlug', getPublicProductBySlug);
router.get('/public/:restaurantId', getPublicProducts);

// Protected admin routes
router.use(protect);
router.use(authorize('restaurant_owner'));

router.route('/').get(getProducts).post(addProduct);
router.route('/:id').put(updateProduct).delete(deleteProduct);

export default router;
