import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const toggleWishlist = async (req, res) => {
  try {
    const { menuItemId } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return errorResponse(res, 404, 'User not found');

    const index = user.wishlist.indexOf(menuItemId);
    if (index === -1) {
      user.wishlist.push(menuItemId);
    } else {
      user.wishlist.splice(index, 1);
    }
    await user.save();
    
    successResponse(res, 200, 'Wishlist updated', user.wishlist);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    successResponse(res, 200, 'Wishlist fetched', user.wishlist);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    successResponse(res, 200, 'Customer orders fetched', orders);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
