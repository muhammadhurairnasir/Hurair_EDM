import { successResponse, errorResponse } from '../utils/responseHandler.js';
import * as menuService from '../services/menu.service.js';

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
