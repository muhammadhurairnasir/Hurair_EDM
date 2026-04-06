import Staff from '../models/Staff.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ restaurantId: req.user.restaurantId });
    successResponse(res, 200, 'Staff fetched', staff);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const addStaff = async (req, res) => {
  try {
    const staff = await Staff.create({ restaurantId: req.user.restaurantId, ...req.body });
    successResponse(res, 201, 'Staff added', staff);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
