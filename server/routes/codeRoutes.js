import express from 'express';
import { db } from '../config/supabaseClient.js';
import { codeUploadSchema, validateBody } from '../validators/zodSchemas.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { verifyCodeWithAgent } from '../services/geminiAgent.js';

const router = express.Router();

// POST /api/code/upload - Upload code and trigger autonomous AI verification
router.post('/upload', authenticateToken, validateBody(codeUploadSchema), async (req, res) => {
  try {
    const { file_name, code_content } = req.validatedBody;
    const userId = req.user.id;

    // 1. Create initial record with 'pending' status
    const initialRecord = await db.codeUploads.create({
      user_id: userId,
      file_name,
      code_content,
      ai_status: 'pending',
      ai_feedback: 'Autonomous AI Verification in progress...'
    });

    // 2. Autonomous Gemini AI Agent inspection
    let verification;
    try {
      verification = await verifyCodeWithAgent(file_name, code_content);
    } catch (agentErr) {
      console.error('Agent verification error:', agentErr);
      verification = {
        ai_status: 'bugged',
        ai_feedback: `Autonomous inspection error: ${agentErr.message}`
      };
    }

    // 3. Update database record with final AI verdict and rich feedback
    const updatedRecord = await db.codeUploads.updateStatusAndFeedback(initialRecord.id, {
      ai_status: verification.ai_status,
      ai_feedback: verification.ai_feedback
    });

    // 4. Log activity
    await db.activityLogs.log({
      user_id: userId,
      action_description: `Uploaded "${file_name}" — AI Agent Verdict: ${verification.ai_status.toUpperCase()}`
    });

    return res.status(201).json({
      success: true,
      message: `Code snippet inspected and verified by AI Agent as: ${verification.ai_status}`,
      code: updatedRecord,
      agentScore: verification.score
    });
  } catch (error) {
    console.error('Code upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during code upload & verification',
      error: error.message
    });
  }
});

// GET /api/code/my-uploads - Fetch all uploads belonging to current logged-in user
router.get('/my-uploads', authenticateToken, async (req, res) => {
  try {
    const uploads = await db.codeUploads.getByUserId(req.user.id);
    return res.json({
      success: true,
      count: uploads.length,
      uploads
    });
  } catch (error) {
    console.error('Fetch uploads error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching code uploads',
      error: error.message
    });
  }
});

// GET /api/code/:id - Get specific code snippet details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const code = await db.codeUploads.getById(id);

    if (!code) {
      return res.status(404).json({
        success: false,
        message: 'Code upload not found'
      });
    }

    // Authorization: member can only view their own code; admin can view all
    if (req.user.role !== 'admin' && code.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this code snippet'
      });
    }

    return res.json({
      success: true,
      code
    });
  } catch (error) {
    console.error('Fetch code by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving code details',
      error: error.message
    });
  }
});

// POST /api/code/:id/reverify - Re-trigger autonomous AI verification on an existing code upload
router.post('/:id/reverify', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const code = await db.codeUploads.getById(id);

    if (!code) {
      return res.status(404).json({
        success: false,
        message: 'Code upload not found'
      });
    }

    if (req.user.role !== 'admin' && code.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Re-verify with Gemini AI Agent
    const verification = await verifyCodeWithAgent(code.file_name, code.code_content);

    const updated = await db.codeUploads.updateStatusAndFeedback(id, {
      ai_status: verification.ai_status,
      ai_feedback: verification.ai_feedback
    });

    await db.activityLogs.log({
      user_id: req.user.id,
      action_description: `Re-verified "${code.file_name}" with AI Agent — Verdict: ${verification.ai_status.toUpperCase()}`
    });

    return res.json({
      success: true,
      message: 'Code re-verified successfully',
      code: updated
    });
  } catch (error) {
    console.error('Reverify error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during re-verification',
      error: error.message
    });
  }
});

export default router;
