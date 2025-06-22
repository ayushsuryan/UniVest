const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'],
    },
    balance: {
      type: Number,
      default: 1000,
      min: [0, 'Balance cannot be negative'],
    },
    // Referral system fields
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    referralBalance: {
      type: Number,
      default: 0,
      min: [0, 'Referral balance cannot be negative'],
    },
    referralTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'diamond'],
      default: 'bronze',
    },
    referralCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    referredByCode: {
      type: String,
    },
    // End of referral fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for email lookup performance
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });

// Generate unique referral code
userSchema.methods.generateReferralCode = async function () {
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'UNIV';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  let code;
  let isUnique = false;

  while (!isUnique) {
    code = generateCode();
    const existing = await this.constructor.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }

  this.referralCode = code;
  return code;
};

// Update referral tier based on referral count
userSchema.methods.updateReferralTier = function () {
  const count = this.referralCount;

  if (count >= 25) {
    // 5 + 7 + 13 = 25
    this.referralTier = 'diamond';
  } else if (count >= 12) {
    // 5 + 7 = 12
    this.referralTier = 'gold';
  } else if (count >= 5) {
    this.referralTier = 'silver';
  } else {
    this.referralTier = 'bronze';
  }

  return this.referralTier;
};

// Get referral tier percentage
userSchema.methods.getReferralTierPercentage = function () {
  switch (this.referralTier) {
    case 'bronze':
      return 30;
    case 'silver':
      return 50;
    case 'gold':
      return 70;
    case 'diamond':
      return 100;
    default:
      return 30;
  }
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Generate referral code if it doesn't exist
  if (this.isNew && !this.referralCode) {
    await this.generateReferralCode();
  }

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);
