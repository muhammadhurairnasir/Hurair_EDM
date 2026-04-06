import User from '../models/User.model.js';
import Restaurant from '../models/Restaurant.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let restaurant = null;
    
    if (user.restaurantId) {
      restaurant = await Restaurant.findById(user.restaurantId);
    }

    successResponse(res, 200, 'Settings fetched', { user, restaurant });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateProfileSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const { name, email, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // mongoose schema handles hashing

    await user.save();
    successResponse(res, 200, 'Profile updated successfully', {
      _id: user._id, name: user.name, email: user.email, role: user.role
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateRestaurantSettings = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!req.user.restaurantId) {
      return errorResponse(res, 403, 'User does not own a restaurant');
    }

    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) return errorResponse(res, 404, 'Restaurant not found');

    if (name) restaurant.name = name;
    if (address) restaurant.address = address;
    if (phone) restaurant.phone = phone;

    await restaurant.save();
    successResponse(res, 200, 'Restaurant updated successfully', restaurant);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
