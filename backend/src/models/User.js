import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    role: {
      type: String,
      enum: ['beneficiary', 'admin'],
      default: 'beneficiary'
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    state: {
      type: String,
      default: 'Demo State',
      trim: true
    },
    district: {
      type: String,
      default: 'Demo District',
      trim: true
    },
    pincode: {
      type: String,
      default: '',
      trim: true
    },
    occupation: {
      type: String,
      default: 'Other',
      trim: true
    },
    socialCategory: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'],
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password when serialized
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
