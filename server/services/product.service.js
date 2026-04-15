import Product from '../models/Product.model.js';

export const getProducts = async (restaurantId) => {
  return await Product.find({ restaurantId });
};

export const addProduct = async (restaurantId, itemData) => {
  return await Product.create({ restaurantId, ...itemData });
};

export const updateProduct = async (id, restaurantId, itemData) => {
  return await Product.findOneAndUpdate({ _id: id, restaurantId }, itemData, { new: true });
};

export const deleteProduct = async (id, restaurantId) => {
  return await Product.findOneAndDelete({ _id: id, restaurantId });
};
