import express from 'express';
import {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  toggleSchemeStatus,
  deleteScheme
} from '../controllers/schemeController.js';
import { protect, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getSchemes);
router.get('/:id', getSchemeById);

// Admin-only scheme management
router.post('/', protect, requireAdmin, createScheme);
router.put('/:id', protect, requireAdmin, updateScheme);
router.patch('/:id/toggle-status', protect, requireAdmin, toggleSchemeStatus);
router.delete('/:id', protect, requireAdmin, deleteScheme);

export default router;
