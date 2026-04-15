import { successResponse, errorResponse } from '../utils/responseHandler.js';
import * as productService from '../services/product.service.js';
import Restaurant from '../models/Restaurant.model.js';
import Product from '../models/Product.model.js';
import Review from '../models/Review.model.js';

export const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts(req.user.restaurantId);
    successResponse(res, 200, 'Products fetched', products);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const getPublicProducts = async (req, res) => {
  try {
    const products = await productService.getProducts(req.params.restaurantId);
    successResponse(res, 200, 'Public products fetched', products);
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

export const addProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    // Auto-generate SEO slug from name if not provided
    if (!body.seo) body.seo = {};
    if (!body.seo.slug && body.name) {
      body.seo.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    const item = await productService.addProduct(req.user.restaurantId, body);
    successResponse(res, 201, 'Product added', item);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const item = await productService.updateProduct(req.params.id, req.user.restaurantId, req.body);
    successResponse(res, 200, 'Product updated', item);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.restaurantId);
    successResponse(res, 200, 'Product deleted');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const getPublicProductBySlug = async (req, res) => {
  try {
    const { slug, productSlug } = req.params;
    
    // Resolve Restaurant
    let restaurant = await Restaurant.findOne({ 'seo.slug': slug });
    if (!restaurant && slug.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(slug);
    }
    if (!restaurant) return errorResponse(res, 404, 'Store not found');

    // Find Product
    let product = await Product.findOne({ restaurantId: restaurant._id, 'seo.slug': productSlug });
    if (!product && productSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findOne({ restaurantId: restaurant._id, _id: productSlug });
    }
    if (!product) return errorResponse(res, 404, 'Product not found');

    // Fetch Reviews
    const reviews = await Review.find({ productId: product._id }).populate('customerId', 'name').sort({ createdAt: -1 });

    successResponse(res, 200, 'Product fetched', { product, reviews, restaurantId: restaurant._id });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
