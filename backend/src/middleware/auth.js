import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getJwtSecret } from '../config/security.js';

const readBearerToken = (req) => {
  const header = req.headers.authorization || '';
  const parts = header.trim().split(/\s+/);

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
    return null;
  }

  return parts[1];
};

export const protect = async (req, res, next) => {
  try {
    const token = readBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide a valid Bearer token.'
      });
    }

    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges are required.'
    });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = readBearerToken(req);
    if (token) {
      const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
      if (decoded?.id) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) req.user = user;
      }
    }
  } catch {
    // Public catalogue requests remain public when an optional token is absent or invalid.
  }

  next();
};
