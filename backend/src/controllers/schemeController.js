import { Scheme } from '../models/Scheme.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getSchemes = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;

    if (status === 'all' && req.user?.role === 'admin') {
      // Administrators may see both active and closed schemes.
    } else if (status === 'closed' && req.user?.role === 'admin') {
      filter.isActive = false;
    } else {
      // Public and beneficiary users can only see active schemes.
      filter.isActive = true;
    }

    if (typeof search === 'string' && search.trim()) {
      const term = escapeRegex(search.trim().slice(0, 100));
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { shortDescription: { $regex: term, $options: 'i' } },
        { code: { $regex: term, $options: 'i' } },
        { sponsoringDepartment: { $regex: term, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: schemes.length, schemes });
  } catch (error) {
    next(error);
  }
};

export const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme || (!scheme.isActive && req.user?.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Government scheme not found' });
    }
    res.status(200).json({ success: true, scheme });
  } catch (error) {
    next(error);
  }
};

export const createScheme = async (req, res, next) => {
  try {
    const {
      title, code, category, shortDescription, fullDescription, sponsoringDepartment,
      targetAudience, benefits, eligibilityCriteria, requiredDocuments, applicationDeadline, isActive
    } = req.body;

    const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    const existingCode = await Scheme.findOne({ code: normalizedCode });
    if (existingCode) {
      return res.status(409).json({ success: false, message: `Scheme with code ${normalizedCode} already exists.` });
    }

    const scheme = await Scheme.create({
      title, code: normalizedCode, category, shortDescription, fullDescription,
      sponsoringDepartment: sponsoringDepartment || 'Department of Public Empowerment (Fictional Demo)',
      targetAudience: targetAudience || 'Eligible Citizens', benefits,
      eligibilityCriteria: eligibilityCriteria || [], requiredDocuments: requiredDocuments || [],
      applicationDeadline: applicationDeadline || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isFictionalDemo: true
    });

    res.status(201).json({ success: true, message: 'Scheme created successfully', scheme });
  } catch (error) {
    next(error);
  }
};

export const updateScheme = async (req, res, next) => {
  try {
    const allowedFields = [
      'title', 'code', 'category', 'shortDescription', 'fullDescription', 'sponsoringDepartment',
      'targetAudience', 'benefits', 'eligibilityCriteria', 'requiredDocuments', 'applicationDeadline', 'isActive'
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (typeof updates.code === 'string') updates.code = updates.code.trim().toUpperCase();

    if (updates.code) {
      const duplicate = await Scheme.findOne({ code: updates.code, _id: { $ne: req.params.id } });
      if (duplicate) return res.status(409).json({ success: false, message: 'A scheme with this code already exists.' });
    }

    const updatedScheme = await Scheme.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true, context: 'query'
    });

    if (!updatedScheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.status(200).json({ success: true, message: 'Scheme updated successfully', scheme: updatedScheme });
  } catch (error) {
    next(error);
  }
};

export const toggleSchemeStatus = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

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

export const deleteScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

    const linkedApplications = await (await import('../models/Application.js')).Application.exists({ scheme: scheme._id });
    if (linkedApplications) {
      return res.status(409).json({
        success: false,
        message: 'This scheme has applications linked to it. Close the scheme instead of deleting it.'
      });
    }

    await Scheme.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Scheme deleted successfully' });
  } catch (error) {
    next(error);
  }
};
