import User from '../models/User.model.js';
import Restaurant from '../models/Restaurant.model.js';
import Order from '../models/Order.model.js';
import Subscription from '../models/Subscription.model.js';
import { PLANS } from '../constants/subscriptionPlans.js';
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

export const getAllRestaurantsSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('restaurantId', 'name address phone seo.slug')
      .sort({ createdAt: -1 });

    successResponse(res, 200, 'Global Subscriptions Fetched', subscriptions);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const forceUpdateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { plan } = req.body;

    if (!Object.values(PLANS).includes(plan)) {
      return errorResponse(res, 400, 'Invalid subscription plan level.');
    }

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) return errorResponse(res, 404, 'Subscription not found');

    sub.plan = plan;
    await sub.save();

    successResponse(res, 200, 'Subscription forcibly updated', sub);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
