/**
 * Workflow status transitions definition and validator.
 * Allowed transitions:
 *  - Submitted -> Under Review
 *  - Under Review -> Approved
 *  - Under Review -> Rejected
 *  - Approved -> Disbursed (Demo status only)
 *  - Rejected -> Under Review (Optional re-evaluation if applicant submits requested clarification)
 */

export const APPLICATION_STATUS = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DISBURSED: 'Disbursed'
};

export const ALLOWED_TRANSITIONS = {
  [APPLICATION_STATUS.SUBMITTED]: [APPLICATION_STATUS.UNDER_REVIEW],
  [APPLICATION_STATUS.UNDER_REVIEW]: [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.APPROVED]: [APPLICATION_STATUS.DISBURSED],
  [APPLICATION_STATUS.REJECTED]: [APPLICATION_STATUS.UNDER_REVIEW], // Allowed for appeal / review
  [APPLICATION_STATUS.DISBURSED]: [] // Terminal demo status
};

export const isValidTransition = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return false;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

export const getAvailableTransitions = (currentStatus) => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};
