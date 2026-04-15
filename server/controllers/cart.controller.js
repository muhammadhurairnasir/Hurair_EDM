import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getCart = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId || req.query.restaurantId;
    let cart = await Cart.findOne({ customerId: req.user._id, restaurantId }).populate('items.product').populate('appliedCoupon');
    
    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, restaurantId, items: [] });
    }
    
    successResponse(res, 200, 'Cart fetched successfully', cart);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const restaurantId = req.user.restaurantId || req.body.restaurantId;

    const product = await Product.findById(productId);
    if (!product) return errorResponse(res, 404, 'Product not found');

    let cart = await Cart.findOne({ customerId: req.user._id, restaurantId });
    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, restaurantId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    successResponse(res, 200, 'Added to cart', cart);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, restaurantId } = req.body;

    const cart = await Cart.findOne({ customerId: req.user._id, restaurantId: restaurantId || req.user.restaurantId });
    if (!cart) return errorResponse(res, 404, 'Cart not found');

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      await cart.populate('items.product');
      return successResponse(res, 200, 'Cart updated', cart);
    }
    
    errorResponse(res, 404, 'Item not found in cart');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const restaurantId = req.query.restaurantId || req.user.restaurantId;

    const cart = await Cart.findOne({ customerId: req.user._id, restaurantId });
    if (!cart) return errorResponse(res, 404, 'Cart not found');

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product');

    successResponse(res, 200, 'Removed from cart', cart);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const clearCart = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId || req.user.restaurantId;
    const cart = await Cart.findOne({ customerId: req.user._id, restaurantId });
    if (cart) {
      cart.items = [];
      cart.appliedCoupon = null;
      await cart.save();
    }
    successResponse(res, 200, 'Cart cleared', cart);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
