import { Application } from '../models/Application.js';
import { Scheme } from '../models/Scheme.js';
import { APPLICATION_STATUS, isValidTransition, getAvailableTransitions } from '../utils/statusWorkflow.js';

const generateApplicationNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
  return `APP-${year}-${randomSuffix}`;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const submitApplication = async (req, res, next) => {
  try {
    const { schemeId, applicantDetails, schemeSpecificData, documents } = req.body;
    const scheme = await Scheme.findById(schemeId);

    if (!scheme) return res.status(404).json({ success: false, message: 'Selected scheme does not exist.' });
    if (!scheme.isActive) return res.status(400).json({ success: false, message: 'This scheme is currently closed for applications.' });
    if (new Date(scheme.applicationDeadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'The application deadline for this scheme has passed.' });
    }

    const existingApplication = await Application.findOne({
      user: req.user._id,
      scheme: schemeId,
      status: { $in: [APPLICATION_STATUS.SUBMITTED, APPLICATION_STATUS.UNDER_REVIEW, APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DISBURSED] }
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: `You have already submitted an active application (${existingApplication.applicationNumber}) for this scheme. Current status: ${existingApplication.status}.`
      });
    }

    const application = await Application.create({
      applicationNumber: generateApplicationNumber(),
      user: req.user._id,
      scheme: schemeId,
      applicantDetails: {
        ...applicantDetails,
        fullName: applicantDetails.fullName || req.user.name,
        email: req.user.email
      },
      schemeSpecificData,
      documents: Array.isArray(documents) ? documents : [],
      status: APPLICATION_STATUS.SUBMITTED,
      statusHistory: [{
        status: APPLICATION_STATUS.SUBMITTED,
        changedBy: req.user._id,
        changedByName: req.user.name,
        changedAt: new Date(),
        remarks: 'Application submitted successfully by citizen.'
      }]
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('scheme', 'title code category sponsoringDepartment benefits')
      .populate('user', 'name email phone');

    res.status(201).json({ success: true, message: 'Application submitted successfully', application: populatedApplication });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const { status, schemeId, search } = req.query;
    const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1));
    const limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit, 10) || 50));
    const filter = {};

    if (req.user.role !== 'admin') filter.user = req.user._id;
    else if (schemeId) filter.scheme = schemeId;

    if (status && status !== 'All' && Object.values(APPLICATION_STATUS).includes(status)) {
      filter.status = status;
    }

    if (typeof search === 'string' && search.trim()) {
      const term = escapeRegex(search.trim().slice(0, 100));
      filter.$or = [
        { applicationNumber: { $regex: term, $options: 'i' } },
        { 'applicantDetails.fullName': { $regex: term, $options: 'i' } },
        { 'applicantDetails.phone': { $regex: term, $options: 'i' } },
        { 'applicantDetails.district': { $regex: term, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('scheme', 'title code category sponsoringDepartment benefits applicationDeadline')
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter)
    ]);

    res.status(200).json({ success: true, count: applications.length, total, page, limit, applications });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('scheme')
      .populate('user', 'name email phone occupation socialCategory address')
      .populate('statusHistory.changedBy', 'name role');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    const ownerId = application.user?._id?.toString();
    if (req.user.role !== 'admin' && ownerId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own applications.' });
    }

    res.status(200).json({
      success: true,
      application,
      availableTransitions: req.user.role === 'admin' ? getAvailableTransitions(application.status) : []
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status: targetStatus, remarks } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const currentStatus = application.status;
    if (!isValidTransition(currentStatus, targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${targetStatus}".`,
        allowedTransitions: getAvailableTransitions(currentStatus),
        workflowRule: 'Submitted → Under Review → Approved / Rejected → Disbursed (from Approved).'
      });
    }

    application.status = targetStatus;
    application.adminRemarks = remarks || `Status transitioned to ${targetStatus} by administrative officer.`;

    const now = new Date();
    if (targetStatus === APPLICATION_STATUS.APPROVED) application.approvedAt = now;
    if (targetStatus === APPLICATION_STATUS.REJECTED) application.rejectedAt = now;
    if (targetStatus === APPLICATION_STATUS.DISBURSED) {
      application.disbursedAt = now;
      application.demoDisbursementReference = `DEMO-DBT-${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    application.statusHistory.push({
      status: targetStatus,
      changedBy: req.user._id,
      changedByName: req.user.name || 'Admin Officer',
      changedAt: now,
      remarks: remarks || `Status updated to ${targetStatus}`
    });

    await application.save();
    const updated = await Application.findById(application._id)
      .populate('scheme', 'title code category benefits')
      .populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Application ${application.applicationNumber} status successfully updated to "${targetStatus}"`,
      application: updated
    });
  } catch (error) {
    next(error);
  }
};
