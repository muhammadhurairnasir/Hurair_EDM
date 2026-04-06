import MenuItem from '../models/MenuItem.model.js';

export const getMenu = async (restaurantId) => {
  return await MenuItem.find({ restaurantId });
};

export const addMenuItem = async (restaurantId, itemData) => {
  return await MenuItem.create({ restaurantId, ...itemData });
};

export const updateMenuItem = async (id, restaurantId, itemData) => {
  return await MenuItem.findOneAndUpdate({ _id: id, restaurantId }, itemData, { new: true });
};

export const deleteMenuItem = async (id, restaurantId) => {
  return await MenuItem.findOneAndDelete({ _id: id, restaurantId });
};
