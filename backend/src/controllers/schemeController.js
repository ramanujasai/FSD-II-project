import { Scheme } from '../models/Scheme.js';

// @desc    Get all schemes (with search & category filtering)
// @route   GET /api/schemes
// @access  Public
export const getSchemes = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by active status
    // If status=all is requested, only admin can view closed schemes; otherwise default to active
    if (status === 'all') {
      if (!req.user || req.user.role !== 'admin') {
        filter.isActive = true;
      }
    } else if (status === 'closed') {
      filter.isActive = false;
    } else {
      filter.isActive = true;
    }

    // Search query on title, shortDescription, code, or department
    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { shortDescription: { $regex: term, $options: 'i' } },
        { code: { $regex: term, $options: 'i' } },
        { sponsoringDepartment: { $regex: term, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schemes.length,
      schemes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single scheme details
// @route   GET /api/schemes/:id
// @access  Public
export const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Government scheme not found'
      });
    }

    res.status(200).json({
      success: true,
      scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new scheme
// @route   POST /api/schemes
// @access  Private (Admin only)
export const createScheme = async (req, res, next) => {
  try {
    const {
      title,
      code,
      category,
      shortDescription,
      fullDescription,
      sponsoringDepartment,
      targetAudience,
      benefits,
      eligibilityCriteria,
      requiredDocuments,
      applicationDeadline,
      isActive
    } = req.body;

    const existingCode = await Scheme.findOne({ code: code?.toUpperCase() });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: `Scheme with code ${code.toUpperCase()} already exists.`
      });
    }

    const scheme = await Scheme.create({
      title,
      code: code ? code.toUpperCase() : undefined,
      category,
      shortDescription,
      fullDescription,
      sponsoringDepartment: sponsoringDepartment || 'Department of Public Empowerment (Fictional Demo)',
      targetAudience: targetAudience || 'Eligible Citizens',
      benefits,
      eligibilityCriteria: eligibilityCriteria || [],
      requiredDocuments: requiredDocuments || [],
      applicationDeadline: applicationDeadline || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: isActive !== undefined ? isActive : true,
      isFictionalDemo: true
    });

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing scheme
// @route   PUT /api/schemes/:id
// @access  Private (Admin only)
export const updateScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    const updatedScheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Scheme updated successfully',
      scheme: updatedScheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close or reopen scheme (toggle active status)
// @route   PATCH /api/schemes/:id/toggle-status
// @access  Private (Admin only)
export const toggleSchemeStatus = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    scheme.isActive = !scheme.isActive;
    await scheme.save();

    res.status(200).json({
      success: true,
      message: `Scheme successfully ${scheme.isActive ? 'reopened' : 'closed'}`,
      scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scheme
// @route   DELETE /api/schemes/:id
// @access  Private (Admin only)
export const deleteScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    await Scheme.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
