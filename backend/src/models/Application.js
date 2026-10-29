import mongoose from 'mongoose';
import { APPLICATION_STATUS } from '../utils/statusWorkflow.js';

const documentSubmissionSchema = new mongoose.Schema(
  {
    documentName: { type: String, required: true },
    documentType: { type: String, default: 'PDF/Image' },
    fileName: { type: String, required: true },
    fileSize: { type: String, default: '500 KB' },
    fileUrl: { type: String, default: '' },
    isMockUploaded: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedByName: {
      type: String,
      default: 'System'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant user reference is required'],
      index: true
    },
    scheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: [true, 'Scheme reference is required'],
      index: true
    },
    applicantDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Prefer not to say' },
      address: { type: String, required: true },
      state: { type: String, required: true },
      district: { type: String, required: true },
      pincode: { type: String, required: true },
      socialCategory: { type: String, default: 'General' },
      annualIncome: { type: Number, required: true },
      occupation: { type: String, required: true }
    },
    schemeSpecificData: {
      purposeOfAssistance: { type: String, required: true, trim: true },
      eligibilityDeclarations: [
        {
          criterion: String,
          declaredEligible: Boolean
        }
      ],
      declarationAccepted: {
        type: Boolean,
        required: [true, 'You must accept the truthfulness declaration'],
        validate: {
          validator: (v) => v === true,
          message: 'Truthfulness declaration must be accepted'
        }
      }
    },
    documents: [documentSubmissionSchema],
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.SUBMITTED,
      index: true
    },
    statusHistory: [statusHistorySchema],
    adminRemarks: {
      type: String,
      default: ''
    },
    approvedAt: {
      type: Date
    },
    rejectedAt: {
      type: Date
    },
    disbursedAt: {
      type: Date
    },
    demoDisbursementReference: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate pending/active application by the same user for the same scheme
applicationSchema.index({ user: 1, scheme: 1 });

export const Application = mongoose.model('Application', applicationSchema);
