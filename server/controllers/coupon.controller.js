import Coupon from '../models/Coupon.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getCoupons = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId || req.user.restaurantId;
    const coupons = await Coupon.find({ restaurantId });
    successResponse(res, 200, 'Coupons fetched successfully', coupons);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const createCoupon = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const coupon = await Coupon.create({ ...req.body, restaurantId });
    successResponse(res, 201, 'Coupon created successfully', coupon);
  } catch (error) {
    if (error.code === 11000) return errorResponse(res, 400, 'Coupon code already exists for this restaurant');
    errorResponse(res, 500, error.message);
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndDelete({ _id: req.params.id, restaurantId: req.user.restaurantId });
    if (!coupon) return errorResponse(res, 404, 'Coupon not found');
    successResponse(res, 200, 'Coupon deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
