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

export const getCustomerCRM = async (req, res) => {
  try {
    // Find all distinct customers who ordered from this exact restaurant
    const customerIds = await Order.distinct('customerId', { restaurantId: req.user.restaurantId });
    const customers = await User.find({ _id: { $in: customerIds } }).select('-password');
    successResponse(res, 200, 'Customer CRM Fetched', customers);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, 'User not found');

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // pre-save hook handles hashing

    await user.save();
    
    // Return sanitized user
    const updatedUser = await User.findById(user._id).select('-password');
    successResponse(res, 200, 'Profile updated successfully', updatedUser);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
