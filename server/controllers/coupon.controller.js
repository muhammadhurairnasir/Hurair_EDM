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

export const verifyPublicCoupon = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { code, cartTotal } = req.body;

    if (!code) return errorResponse(res, 400, 'Coupon code is required');

    const coupon = await Coupon.findOne({ restaurantId, code: code.toUpperCase(), isActive: true });
    
    if (!coupon) return errorResponse(res, 404, 'Invalid or expired coupon code');
    
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) return errorResponse(res, 400, 'Coupon is not yet active');
    if (coupon.validUntil && now > coupon.validUntil) return errorResponse(res, 400, 'Coupon has expired');
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return errorResponse(res, 400, 'Coupon usage limit reached');
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) return errorResponse(res, 400, `Minimum order value of $${coupon.minOrderValue} required`);

    successResponse(res, 200, 'Coupon is valid', coupon);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
