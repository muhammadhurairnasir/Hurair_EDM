import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { errorResponse } from '../utils/responseHandler.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return errorResponse(res, 401, 'Not authorized, token failed');
    }
  }
  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token');
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 403, `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`);
    }
    next();
  };
};
