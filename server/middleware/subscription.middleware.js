import Subscription from '../models/Subscription.model.js';
import { errorResponse } from '../utils/responseHandler.js';
import { PLAN_FEATURES, PLANS } from '../constants/subscriptionPlans.js';

export const checkPlan = (requiredFeature) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.restaurantId) {
        return errorResponse(res, 403, 'Restaurant context missing');
      }

      const subscription = await Subscription.findOne({ restaurantId: req.user.restaurantId, status: 'active' });
      if (!subscription) {
        return errorResponse(res, 403, 'No active subscription found');
      }

      const features = PLAN_FEATURES[subscription.plan] || PLAN_FEATURES[PLANS.BASIC];
      if (!features.includes(requiredFeature)) {
        return errorResponse(res, 403, `Upgrade plan to access ${requiredFeature}`);
      }

      return next();
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  };
};
