import User from '../models/User.model.js';
import Restaurant from '../models/Restaurant.model.js';
import Order from '../models/Order.model.js';
import Subscription from '../models/Subscription.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getSystemStats = async (req, res) => {
  try {
    const totalRestaurants = await Restaurant.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total SaaS revenue (simplistic mock based on active subscriptions)
    const standardSubs = await Subscription.countDocuments({ plan: 'Standard' });
    const premiumSubs = await Subscription.countDocuments({ plan: 'Premium' });
    
    const monthlyRecurringRevenue = (standardSubs * 79) + (premiumSubs * 149);

    successResponse(res, 200, 'System stats fetched', {
      totalRestaurants,
      totalUsers,
      totalOrders,
      monthlyRecurringRevenue
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
