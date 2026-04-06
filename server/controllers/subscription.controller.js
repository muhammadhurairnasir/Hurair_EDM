import Subscription from '../models/Subscription.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ restaurantId: req.user.restaurantId });
    successResponse(res, 200, 'Subscription fetched', sub);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { restaurantId: req.user.restaurantId },
      { plan: req.body.plan },
      { new: true }
    );
    successResponse(res, 200, 'Subscription updated', sub);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
