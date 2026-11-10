import { APPLICATION_STATUS } from '../utils/statusWorkflow.js';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const containsSensitiveField = (value) => {
  if (Array.isArray(value)) return value.some(containsSensitiveField);
  if (!isPlainObject(value)) return false;

  return Object.entries(value).some(([key, nestedValue]) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const prohibited = /(aadhaar|aadhar|uidnumber|bankaccount|accountnumber|cardnumber|cardcvv|cvv|upiid|paymentdetails)/;
    return prohibited.test(normalizedKey) || containsSensitiveField(nestedValue);
  });
};

export const validateRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body || {};
  const errors = [];

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    errors.push('Full name must be between 2 and 100 characters');
  }
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    errors.push('A valid email address is required');
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    errors.push('Password must be between 12 and 128 characters');
  }
  if (typeof phone !== 'string' || phone.trim().length < 7 || phone.trim().length > 20) {
    errors.push('A valid contact phone number is required');
  }

  if (req.body?.role && req.body.role !== 'beneficiary') {
    return res.status(403).json({
      success: false,
      message: 'Public registration is restricted to beneficiary accounts.'
    });
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Invalid registration input', errors });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    errors.push('A valid email address is required');
  }
  if (typeof password !== 'string' || password.length === 0 || password.length > 128) {
    errors.push('Password is required');
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Invalid login input', errors });
  }

  next();
};

export const validateApplicationSubmission = (req, res, next) => {
  const { schemeId, applicantDetails, schemeSpecificData } = req.body || {};
  const errors = [];

  if (containsSensitiveField(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Sensitive identity, banking, and payment fields are not accepted by this demonstration system.'
    });
  }

  if (typeof schemeId !== 'string' || !/^[a-f\d]{24}$/i.test(schemeId)) {
    errors.push('A valid scheme ID is required');
  }

  if (!isPlainObject(applicantDetails)) {
    errors.push('Applicant details are required');
  } else {
    if (typeof applicantDetails.fullName !== 'string' || !applicantDetails.fullName.trim()) errors.push('Applicant full name is required');
    if (typeof applicantDetails.phone !== 'string' || !applicantDetails.phone.trim()) errors.push('Applicant phone number is required');
    if (typeof applicantDetails.address !== 'string' || !applicantDetails.address.trim()) errors.push('Residential address is required');
    if (typeof applicantDetails.state !== 'string' || !applicantDetails.state.trim()) errors.push('State is required');
    if (typeof applicantDetails.district !== 'string' || !applicantDetails.district.trim()) errors.push('District is required');
    if (typeof applicantDetails.pincode !== 'string' || !/^\d{6}$/.test(applicantDetails.pincode)) errors.push('A valid six-digit PIN code is required');
    if (!Number.isFinite(Number(applicantDetails.annualIncome)) || Number(applicantDetails.annualIncome) < 0) errors.push('Valid annual income is required');
  }

  if (!isPlainObject(schemeSpecificData)) {
    errors.push('Scheme specific data is required');
  } else {
    if (typeof schemeSpecificData.purposeOfAssistance !== 'string' || schemeSpecificData.purposeOfAssistance.trim().length < 5) {
      errors.push('Please describe the purpose of assistance (minimum 5 characters)');
    }
    if (schemeSpecificData.declarationAccepted !== true) {
      errors.push('You must confirm and accept the declaration of truthfulness');
    }
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Application validation failed', errors });
  }

  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { status, remarks } = req.body || {};
  const errors = [];

  if (!Object.values(APPLICATION_STATUS).includes(status)) {
    errors.push('A valid target application status is required');
  }
  if (remarks !== undefined && (typeof remarks !== 'string' || remarks.length > 1000)) {
    errors.push('Remarks must be a string of at most 1000 characters');
  }
  if (status === APPLICATION_STATUS.REJECTED && (typeof remarks !== 'string' || remarks.trim().length < 3)) {
    errors.push('Remarks / reason are required when rejecting an application');
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Status update validation failed', errors });
  }

  next();
};
