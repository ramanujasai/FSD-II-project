import { Application } from '../models/Application.js';
import { Scheme } from '../models/Scheme.js';
import { User } from '../models/User.js';
import { APPLICATION_STATUS } from '../utils/statusWorkflow.js';

// @desc    Get dashboard metrics and analytics summary
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBeneficiaries,
      totalSchemes,
      activeSchemes,
      totalApplications,
      submittedCount,
      underReviewCount,
      approvedCount,
      rejectedCount,
      disbursedCount
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

    // Aggregate applications by scheme category
    const categoryStats = await Application.aggregate([
      {
        $lookup: {
          from: 'schemes',
          localField: 'scheme',
          foreignField: '_id',
          as: 'schemeInfo'
        }
      },
      { $unwind: '$schemeInfo' },
      {
        $group: {
          _id: '$schemeInfo.category',
          count: { $sum: 1 },
          approvedCount: {
            $sum: {
              $cond: [
                { $in: ['$status', [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DISBURSED]] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBeneficiaries,
        totalSchemes,
        activeSchemes,
        totalApplications,
        countsByStatus: {
          submitted: submittedCount,
          underReview: underReviewCount,
          approved: approvedCount,
          rejected: rejectedCount,
          disbursed: disbursedCount
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled beneficiaries directory (Approved & Disbursed applications)
// @route   GET /api/admin/beneficiaries
// @access  Private (Admin only)
export const getBeneficiaryDirectory = async (req, res, next) => {
  try {
    const { search, schemeId, status } = req.query;
    const filter = {
      status: { $in: [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DISBURSED] }
    };

    if (status && (status === APPLICATION_STATUS.APPROVED || status === APPLICATION_STATUS.DISBURSED)) {
      filter.status = status;
    }

    if (schemeId) {
      filter.scheme = schemeId;
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { applicationNumber: { $regex: term, $options: 'i' } },
        { 'applicantDetails.fullName': { $regex: term, $options: 'i' } },
        { 'applicantDetails.phone': { $regex: term, $options: 'i' } },
        { 'applicantDetails.district': { $regex: term, $options: 'i' } }
      ];
    }

    const beneficiaries = await Application.find(filter)
      .populate('scheme', 'title code category benefits sponsoringDepartment')
      .populate('user', 'name email phone occupation socialCategory address')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: beneficiaries.length,
      beneficiaries
    });
  } catch (error) {
    next(error);
  }
};
