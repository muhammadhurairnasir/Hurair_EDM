import express from 'express';
import { getTables, addTable, updateTableStatus, deleteTable } from '../controllers/table.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('restaurant_owner'));

router.route('/').get(getTables).post(addTable);
router.route('/:id/status').put(updateTableStatus);
router.route('/:id').delete(deleteTable);

export default router;
