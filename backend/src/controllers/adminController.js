import { Application } from '../models/Application.js';
import { Scheme } from '../models/Scheme.js';
import { User } from '../models/User.js';
import { APPLICATION_STATUS } from '../utils/statusWorkflow.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalBeneficiaries, totalSchemes, activeSchemes, totalApplications,
      submittedCount, underReviewCount, approvedCount, rejectedCount, disbursedCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'beneficiary' }),
      Scheme.countDocuments(),
      Scheme.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Application.countDocuments({ status: APPLICATION_STATUS.SUBMITTED }),
      Application.countDocuments({ status: APPLICATION_STATUS.UNDER_REVIEW }),
      Application.countDocuments({ status: APPLICATION_STATUS.APPROVED }),
      Application.countDocuments({ status: APPLICATION_STATUS.REJECTED }),
      Application.countDocuments({ status: APPLICATION_STATUS.DISBURSED })
    ]);

    const categoryStats = await Application.aggregate([
      { $lookup: { from: 'schemes', localField: 'scheme', foreignField: '_id', as: 'schemeInfo' } },
      { $unwind: '$schemeInfo' },
      {
        $group: {
          _id: '$schemeInfo.category',
          count: { $sum: 1 },
          approvedCount: {
            $sum: {
              $cond: [{ $in: ['$status', [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DISBURSED]] }, 1, 0]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers, totalBeneficiaries, totalSchemes, activeSchemes, totalApplications,
        countsByStatus: {
          submitted: submittedCount, underReview: underReviewCount, approved: approvedCount,
          rejected: rejectedCount, disbursed: disbursedCount
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBeneficiaryDirectory = async (req, res, next) => {
  try {
    const { search, schemeId, status } = req.query;
    const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1));
    const limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit, 10) || 50));
    const filter = { status: { $in: [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DISBURSED] } };

    if (status && [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DISBURSED].includes(status)) filter.status = status;
    if (schemeId) filter.scheme = schemeId;

    if (typeof search === 'string' && search.trim()) {
      const term = escapeRegex(search.trim().slice(0, 100));
      filter.$or = [
        { applicationNumber: { $regex: term, $options: 'i' } },
        { 'applicantDetails.fullName': { $regex: term, $options: 'i' } },
        { 'applicantDetails.phone': { $regex: term, $options: 'i' } },
        { 'applicantDetails.district': { $regex: term, $options: 'i' } }
      ];
    }

    const [beneficiaries, total] = await Promise.all([
      Application.find(filter)
        .populate('scheme', 'title code category benefits sponsoringDepartment')
        .populate('user', 'name email phone occupation socialCategory address')
        .sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
      Application.countDocuments(filter)
    ]);

    res.status(200).json({ success: true, count: beneficiaries.length, total, page, limit, beneficiaries });
  } catch (error) {
    next(error);
  }
};
