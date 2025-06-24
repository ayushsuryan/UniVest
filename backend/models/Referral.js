const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Referrer is required'],
      index: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Referred user is required'],
      index: true,
    },
    referralCode: {
      type: String,
      required: [true, 'Referral code is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive'],
      default: 'pending',
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    earnings: [
      {
        amount: {
          type: Number,
          required: true,
        },
        fromInvestment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Investment',
        },
        assetName: String,
        hourlyReturn: Number,
        tierPercentage: Number,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    signupDate: {
      type: Date,
      default: Date.now,
    },
    firstInvestmentDate: Date,
    lastActiveDate: Date,
    monthlyEarningsHistory: [
      {
        month: String, // Format: "2024-01"
        earnings: Number,
        timestamp: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Compound index for unique referral relationships
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

// Static method to get referrer's team
referralSchema.statics.getReferrerTeam = async function (referrerId) {
  const referrals = await this.find({ referrer: referrerId })
    .populate(
      'referred',
      'firstName lastName email phone isEmailVerified createdAt',
    )
    .sort({ signupDate: -1 });

  return referrals;
};

// Static method to get referral analytics
referralSchema.statics.getReferralAnalytics = async function (referrerId) {
  const referrals = await this.find({ referrer: referrerId });

  const totalMembers = referrals.length;
  const activeMembers = referrals.filter(r => r.status === 'active').length;
  const pendingMembers = referrals.filter(r => r.status === 'pending').length;
  const totalEarnings = referrals.reduce((sum, r) => sum + r.totalEarnings, 0);

  // Calculate current month earnings
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyEarnings = referrals.reduce(
    (sum, r) => sum + r.monthlyEarnings,
    0,
  );

  return {
    totalMembers,
    activeMembers,
    pendingMembers,
    totalEarnings,
    monthlyEarnings,
    conversionRate:
      totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : 0,
  };
};

// Instance method to add earning
referralSchema.methods.addEarning = async function (
  amount,
  fromInvestment,
  assetName,
  hourlyReturn,
  tierPercentage,
) {
  this.earnings.push({
    amount,
    fromInvestment,
    assetName,
    hourlyReturn,
    tierPercentage,
  });

  this.totalEarnings += amount;
  this.monthlyEarnings += amount;
  this.lastActiveDate = new Date();

  // ✅ REMOVED: Automatic status change from pending to active
  // Status should only be changed explicitly through activateReferralOnFirstInvestment()
  // This ensures referrals only become active when user makes their first investment

  return this.save();
};

// Instance method to reset monthly earnings
referralSchema.methods.resetMonthlyEarnings = async function () {
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Save to history
  this.monthlyEarningsHistory.push({
    month: currentMonth,
    earnings: this.monthlyEarnings,
    timestamp: new Date(),
  });

  // Reset monthly earnings
  this.monthlyEarnings = 0;

  return this.save();
};

module.exports = mongoose.model('Referral', referralSchema);
