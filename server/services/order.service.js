import Order from '../models/Order.model.js';

export const createOrder = async (restaurantId, orderData) => {
  const order = new Order({ restaurantId, ...orderData });
  return await order.save();
};

export const getOrders = async (restaurantId) => {
  return await Order.find({ restaurantId }).sort({ createdAt: -1 });
};

export const updateOrder = async (orderId, restaurantId, updates) => {
  return await Order.findOneAndUpdate({ _id: orderId, restaurantId }, updates, { new: true });
};
