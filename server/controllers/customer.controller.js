import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import Review from '../models/Review.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return errorResponse(res, 404, 'User not found');

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
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
    const orders = await Order.find({ customerId: req.user._id })
      .populate('items.product', 'name price images seo')
      .sort({ createdAt: -1 });
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
export const submitReview = async (req, res) => {
  try {
    const { productId, restaurantId, rating, comment } = req.body;
    if (!productId || !restaurantId || !rating || !comment) {
      return errorResponse(res, 400, 'All fields are required');
    }
    // Prevent duplicate review
    const existing = await Review.findOne({ productId, customerId: req.user._id });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      return successResponse(res, 200, 'Review updated', existing);
    }
    const review = await Review.create({
      productId,
      restaurantId,
      customerId: req.user._id,
      rating,
      comment
    });
    const populated = await Review.findById(review._id).populate('customerId', 'name');
    successResponse(res, 201, 'Review submitted', populated);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
