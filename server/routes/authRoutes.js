import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/supabaseClient.js';
import { registerSchema, loginSchema, validateBody } from '../validators/zodSchemas.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_agentic_jwt_key_2026_change_in_production';

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { email, password, role } = req.validatedBody;

    // Check if user already exists
    const existing = await db.users.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.users.create({
      email,
      password_hash,
      role: role || 'member'
    });

    // Log activity
    await db.activityLogs.log({
      user_id: newUser.id,
      action_description: `User registered with role "${newUser.role}"`
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    const user = await db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Log activity
    await db.activityLogs.log({
      user_id: user.id,
      action_description: `User signed in to AgenticSync`
    });

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

export default router;
