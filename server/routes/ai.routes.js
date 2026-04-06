import express from 'express';
import { handleChat, getRecommendations } from '../controllers/ai.controller.js';

const router = express.Router();

// Public routes for storefront chatbot and recommendations
router.post('/chat', handleChat);
router.get('/recommendations/:restaurantId', getRecommendations);

export default router;
