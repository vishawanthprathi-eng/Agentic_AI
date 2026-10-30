import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/supabaseClient.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { updateUserRoleSchema, registerSchema, validateBody } from '../validators/zodSchemas.js';

const router = express.Router();

// Apply auth + admin guard to all routes in admin router
router.use(authenticateToken, requireAdmin);

// GET /api/admin/metrics - Global summary metrics and chart data
router.get('/metrics', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const uploads = await db.codeUploads.getAll();
    const logs = await db.activityLogs.getAll(50);

    const totalUsers = users.length;
    const totalUploads = uploads.length;

    const verifiedCount = uploads.filter(u => u.ai_status === 'verified').length;
    const buggedCount = uploads.filter(u => u.ai_status === 'bugged').length;
    const pendingCount = uploads.filter(u => u.ai_status === 'pending').length;

    const passRate = totalUploads > 0 ? Math.round((verifiedCount / totalUploads) * 100) : 0;

    // Per member upload stats
    const memberStats = users.map(user => {
      const userUploads = uploads.filter(u => u.user_id === user.id);
      const userVerified = userUploads.filter(u => u.ai_status === 'verified').length;
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        totalUploads: userUploads.length,
        verifiedCount: userVerified,
        buggedCount: userUploads.length - userVerified
      };
    });

    // Verification distribution for PieChart
    const statusDistribution = [
      { name: 'Verified', value: verifiedCount, color: '#10B981' },
      { name: 'Bugged', value: buggedCount, color: '#EF4444' },
      { name: 'Pending', value: pendingCount, color: '#F59E0B' }
    ];

    // Activity timeline grouping (e.g. by date or recent activities)
    const recentUploadsTimeline = uploads.slice(0, 10).reverse().map((u, i) => ({
      index: i + 1,
      name: u.file_name.length > 15 ? u.file_name.substring(0, 12) + '...' : u.file_name,
      status: u.ai_status,
      date: new Date(u.created_at).toLocaleDateString()
    }));

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        totalUploads,
        verifiedCount,
        buggedCount,
        pendingCount,
        passRate,
        statusDistribution,
        memberStats,
        recentUploadsTimeline,
        recentLogsCount: logs.length
      }
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin metrics',
      error: error.message
    });
  }
});

// GET /api/admin/users - Get all team members with stats
router.get('/users', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const uploads = await db.codeUploads.getAll();

    const enrichedUsers = users.map(u => {
      const userUploads = uploads.filter(code => code.user_id === u.id);
      const verified = userUploads.filter(code => code.ai_status === 'verified').length;
      return {
        ...u,
        totalUploads: userUploads.length,
        verifiedUploads: verified,
        buggedUploads: userUploads.length - verified
      };
    });

    return res.json({
      success: true,
      users: enrichedUsers
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users',
      error: error.message
    });
  }
});

// POST /api/admin/users - Admin adds/invites a new team member
router.post('/users', validateBody(registerSchema), async (req, res) => {
  try {
    const { email, password, role } = req.validatedBody;

    const existing = await db.users.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.users.create({
      email,
      password_hash,
      role: role || 'member'
    });

    await db.activityLogs.log({
      user_id: req.user.id,
      action_description: `Admin created team member "${newUser.email}" with role "${newUser.role}"`
    });

    return res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating team member',
      error: error.message
    });
  }
});

// PUT /api/admin/users/:id/role - Update a team member's role
router.put('/users/:id/role', validateBody(updateUserRoleSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.validatedBody;

    const updatedUser = await db.users.updateRole(id, role);

    await db.activityLogs.log({
      user_id: req.user.id,
      action_description: `Admin updated role of user "${updatedUser.email}" to "${role}"`
    });

    return res.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating user role',
      error: error.message
    });
  }
});

// GET /api/admin/code-uploads - Global code uploads list
router.get('/code-uploads', async (req, res) => {
  try {
    const uploads = await db.codeUploads.getAll();
    return res.json({
      success: true,
      uploads
    });
  } catch (error) {
    console.error('Admin code uploads error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving code uploads',
      error: error.message
    });
  }
});

// GET /api/admin/activity-logs - Complete activity log audit trail
router.get('/activity-logs', async (req, res) => {
  try {
    const logs = await db.activityLogs.getAll(100);
    return res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Admin logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving activity logs',
      error: error.message
    });
  }
});

export default router;
