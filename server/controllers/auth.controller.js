import User from '../models/User.model.js';
import Restaurant from '../models/Restaurant.model.js';
import Subscription from '../models/Subscription.model.js';
import { generateToken } from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, restaurantName } = req.body;
    let user = await User.findOne({ email });
    if (user) return errorResponse(res, 400, 'User already exists');

    user = await User.create({ name, email, password, role: 'restaurant_owner' });
    
    // Automatically generate a unique slug to prevent E11000 duplicate key errors on the seo.slug index
    const uniqueSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    
    const restaurant = await Restaurant.create({ 
      name: restaurantName, 
      owner: user._id,
      seo: { slug: uniqueSlug }
    });
    
    user.restaurantId = restaurant._id;
    await user.save();

    await Subscription.create({ restaurantId: restaurant._id, plan: 'Basic' });

    successResponse(res, 201, 'Registered successfully', {
      _id: user._id, name: user.name, email: user.email, token: generateToken(user._id)
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      successResponse(res, 200, 'Login successful', {
        _id: user._id, name: user.name, email: user.email, role: user.role,
        restaurantId: user.restaurantId || null,
        token: generateToken(user._id)
      });
    } else {
      errorResponse(res, 401, 'Invalid credentials');
    }
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return errorResponse(res, 400, 'User already exists');

    user = await User.create({ name, email, password, role: 'customer' });

    successResponse(res, 201, 'Customer registered successfully', {
      _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id)
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
