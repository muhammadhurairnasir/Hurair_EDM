import { successResponse, errorResponse } from '../utils/responseHandler.js';
import * as orderService from '../services/order.service.js';

export const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user.restaurantId, req.body);
    successResponse(res, 201, 'Order created', order);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const createPublicOrder = async (req, res) => {
  try {
    const { restaurantId, ...orderData } = req.body;
    if (!restaurantId) return errorResponse(res, 400, 'restaurantId is required for public orders');
    
    const order = await orderService.createOrder(restaurantId, orderData);
    successResponse(res, 201, 'Public order created', order);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrders(req.user.restaurantId);
    successResponse(res, 200, 'Orders fetched', orders);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.user.restaurantId, req.body);
    if (!order) return errorResponse(res, 404, 'Order not found');
    successResponse(res, 200, 'Order updated', order);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
