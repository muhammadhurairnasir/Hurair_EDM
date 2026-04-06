import Table from '../models/Table.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getTables = async (req, res) => {
  try {
    const tables = await Table.find({ restaurantId: req.user.restaurantId });
    successResponse(res, 200, 'Tables fetched', tables);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const addTable = async (req, res) => {
  try {
    const table = await Table.create({ restaurantId: req.user.restaurantId, ...req.body });
    successResponse(res, 201, 'Table added', table);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const updateTableStatus = async (req, res) => {
  try {
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.user.restaurantId },
      { status: req.body.status },
      { new: true }
    );
    successResponse(res, 200, 'Table updated', table);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const deleteTable = async (req, res) => {
  try {
    await Table.findOneAndDelete({ _id: req.params.id, restaurantId: req.user.restaurantId });
    successResponse(res, 200, 'Table deleted');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
