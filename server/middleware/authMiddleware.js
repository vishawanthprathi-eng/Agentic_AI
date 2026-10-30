import jwt from 'jsonwebtoken';
import { db } from '../config/supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_agentic_jwt_key_2026_change_in_production';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.users.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: User no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin privileges required'
    });
  }
  next();
};
