import express from 'express';
import { getAdminStats, getBeneficiaryDirectory } from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin-only routes
router.use(protect, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/beneficiaries', getBeneficiaryDirectory);

export default router;
