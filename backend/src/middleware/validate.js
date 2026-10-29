export const validateRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('A valid email address is required');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    errors.push('A valid contact phone number is required');
  }

  // Enforce security rule: Admin accounts cannot be registered publicly
  if (req.body.role && req.body.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts cannot be created via public registration. Contact system administration.'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Invalid registration input', errors });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('A valid email address is required');
  }
  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Invalid login input', errors });
  }

  next();
};

export const validateApplicationSubmission = (req, res, next) => {
  const { schemeId, applicantDetails, schemeSpecificData } = req.body;
  const errors = [];

  if (!schemeId) {
    errors.push('Scheme ID is required');
  }

  if (!applicantDetails) {
    errors.push('Applicant details are required');
  } else {
    if (!applicantDetails.fullName) errors.push('Applicant full name is required');
    if (!applicantDetails.phone) errors.push('Applicant phone number is required');
    if (!applicantDetails.address) errors.push('Residential address is required');
    if (!applicantDetails.state) errors.push('State is required');
    if (!applicantDetails.district) errors.push('District is required');
    if (!applicantDetails.pincode) errors.push('PIN code is required');
    if (applicantDetails.annualIncome === undefined || applicantDetails.annualIncome === null || isNaN(applicantDetails.annualIncome)) {
      errors.push('Valid annual income is required');
    }
  }

  if (!schemeSpecificData) {
    errors.push('Scheme specific data is required');
  } else {
    if (!schemeSpecificData.purposeOfAssistance || schemeSpecificData.purposeOfAssistance.trim().length < 5) {
      errors.push('Please describe the purpose of assistance (minimum 5 characters)');
    }
    if (schemeSpecificData.declarationAccepted !== true) {
      errors.push('You must confirm and accept the declaration of truthfulness');
    }
  }

  // Explicit check against disallowed sensitive fields per user instructions:
  // "Do not collect Aadhaar numbers, bank account numbers, or real payment details."
  const bodyString = JSON.stringify(req.body).toLowerCase();
  if (bodyString.includes('aadhaar') || bodyString.includes('bankaccount') || bodyString.includes('cardnumber')) {
    return res.status(400).json({
      success: false,
      message: 'Sensitive financial credentials or national identity numbers (Aadhaar/Bank details) are prohibited in this system.'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Application validation failed', errors });
  }

  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { status, remarks } = req.body;
  const errors = [];

  if (!status) {
    errors.push('Target status is required');
  }

  if (status === 'Rejected' && (!remarks || remarks.trim().length < 3)) {
    errors.push('Remarks / reason are required when rejecting an application');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Status update validation failed', errors });
  }

  next();
};
