import { successResponse, errorResponse } from '../utils/responseHandler.js';
import * as menuService from '../services/menu.service.js';
import Restaurant from '../models/Restaurant.model.js';
import MenuItem from '../models/MenuItem.model.js';
import Review from '../models/Review.model.js';

export const getMenu = async (req, res) => {
  try {
    const menu = await menuService.getMenu(req.user.restaurantId);
    successResponse(res, 200, 'Menu fetched', menu);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const getPublicMenu = async (req, res) => {
  try {
    const menu = await menuService.getMenu(req.params.restaurantId);
    successResponse(res, 200, 'Public menu fetched', menu);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const resolveStoreSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let restaurant = await Restaurant.findOne({ 'seo.slug': slug }).select('_id name seo');
    
    // Fallback: If it's a valid BSON ID and wasn't found by slug
    if (!restaurant && slug.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(slug).select('_id name seo');
    }

    if (!restaurant) return errorResponse(res, 404, 'Store not found');
    successResponse(res, 200, 'Store resolved', restaurant);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const addMenuItem = async (req, res) => {
  try {
    const item = await menuService.addMenuItem(req.user.restaurantId, req.body);
    successResponse(res, 201, 'Menu item added', item);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const item = await menuService.updateMenuItem(req.params.id, req.user.restaurantId, req.body);
    successResponse(res, 200, 'Menu item updated', item);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    await menuService.deleteMenuItem(req.params.id, req.user.restaurantId);
    successResponse(res, 200, 'Menu item deleted');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const getPublicMenuItemBySlug = async (req, res) => {
  try {
    const { slug, productSlug } = req.params;
    
    // Resolve Restaurant
    let restaurant = await Restaurant.findOne({ 'seo.slug': slug });
    if (!restaurant && slug.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(slug);
    }
    if (!restaurant) return errorResponse(res, 404, 'Store not found');

    // Find Product
    let product = await MenuItem.findOne({ restaurantId: restaurant._id, 'seo.slug': productSlug });
    if (!product && productSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await MenuItem.findOne({ restaurantId: restaurant._id, _id: productSlug });
    }
    if (!product) return errorResponse(res, 404, 'Product not found');

    // Fetch Reviews
    const reviews = await Review.find({ menuItemId: product._id }).populate('customerId', 'name').sort({ createdAt: -1 });

    successResponse(res, 200, 'Product fetched', { product, reviews, restaurantId: restaurant._id });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
