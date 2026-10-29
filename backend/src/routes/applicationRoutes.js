import express from 'express';
import {
  submitApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus
} from '../controllers/applicationController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validateApplicationSubmission, validateStatusUpdate } from '../middleware/validate.js';

const router = express.Router();

// All application routes require authentication
router.use(protect);

router.post('/', validateApplicationSubmission, submitApplication);
router.get('/', getApplications);
router.get('/:id', getApplicationById);

// Status updates require Admin privileges
router.patch('/:id/status', requireAdmin, validateStatusUpdate, updateApplicationStatus);

export default router;
