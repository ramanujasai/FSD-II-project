import mongoose from 'mongoose';

const eligibilityItemSchema = new mongoose.Schema(
  {
    criterion: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    mandatory: { type: Boolean, default: true }
  },
  { _id: false }
);

const documentItemSchema = new mongoose.Schema(
  {
    documentName: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    mandatory: { type: Boolean, default: true }
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Scheme title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    code: {
      type: String,
      required: [true, 'Scheme code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Scheme category is required'],
      enum: [
        'Agriculture & Farming',
        'Education & Skill',
        'Healthcare',
        'Housing & Sanitation',
        'Women & Child Development',
        'Senior Citizen & Social Security',
        'Financial Inclusion & Microenterprise'
      ]
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true
    },
    sponsoringDepartment: {
      type: String,
      required: [true, 'Sponsoring department is required'],
      default: 'Department of Public Welfare (Fictional Demo)'
    },
    targetAudience: {
      type: String,
      default: 'Eligible citizens meeting specified criteria'
    },
    benefits: {
      summary: {
        type: String,
        required: [true, 'Benefit summary is required'],
        trim: true
      },
      type: {
        type: String,
        enum: [
          'Direct Financial Subsidy',
          'Scholarship Allowance',
          'Health Insurance Cover',
          'Equipment Grant',
          'Reimbursement',
          'Loan Subvention'
        ],
        default: 'Direct Financial Subsidy'
      },
      amountOrValue: {
        type: String,
        default: 'Varies by eligibility (Demo)'
      },
      disbursementMode: {
        type: String,
        default: 'Direct Benefit Transfer Simulation (No Real Money)'
      }
    },
    eligibilityCriteria: [eligibilityItemSchema],
    requiredDocuments: [documentItemSchema],
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFictionalDemo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Search indexing for fast catalogue search
schemeSchema.index({ title: 'text', shortDescription: 'text', sponsoringDepartment: 'text' });

export const Scheme = mongoose.model('Scheme', schemeSchema);
