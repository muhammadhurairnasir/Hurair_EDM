import { successResponse, errorResponse } from '../utils/responseHandler.js';
import * as dashboardService from '../services/dashboard.service.js';

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user.restaurantId);
    successResponse(res, 200, 'Dashboard stats fetched', stats);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
