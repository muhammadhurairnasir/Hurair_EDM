import Order from '../models/Order.model.js';
import MenuItem from '../models/MenuItem.model.js';
import Table from '../models/Table.model.js';

export const getDashboardStats = async (restaurantId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ordersToday = await Order.countDocuments({
    restaurantId,
    createdAt: { $gte: today }
  });

  const revenueAggregation = await Order.aggregate([
    { $match: { restaurantId, status: 'Completed', createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

  const totalMenuItems = await MenuItem.countDocuments({ restaurantId });
  const activeTables = await Table.countDocuments({ restaurantId, status: 'occupied' });

  return { ordersToday, totalRevenue, totalMenuItems, activeTables };
};
