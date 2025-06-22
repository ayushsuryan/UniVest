const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    investedAmount: {
      type: Number,
      required: [true, 'Invested amount is required'],
      min: [0, 'Invested amount cannot be negative'],
    },
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
      min: [0, 'Current value cannot be negative'],
    },
    totalReturns: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'matured', 'cashed_out'],
      default: 'active',
    },
    investmentDate: {
      type: Date,
      default: Date.now,
    },
    maturityDate: {
      type: Date,
      required: [true, 'Maturity date is required'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    hourlyReturns: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        returnAmount: {
          type: Number,
          required: true,
        },
        returnPercentage: {
          type: Number,
          required: true,
        },
      },
    ],
    cashOutDetails: {
      cashOutDate: Date,
      penaltyAmount: Number,
      finalAmount: Number,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
investmentSchema.index({ user: 1 });
investmentSchema.index({ asset: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ investmentDate: -1 });

// Static method to get user investments
investmentSchema.statics.getUserInvestments = function (userId, status = null) {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate(
      'asset',
      'name category image price hourlyReturnPercentage maturityPeriod',
    )
    .sort({ investmentDate: -1 });
};

// Static method to get user portfolio stats
investmentSchema.statics.getUserPortfolioStats = async function (userId) {
  const investments = await this.find({ user: userId });

  // Separate active/matured investments from cashed-out ones
  const activeInvestments = investments.filter(
    inv => inv.status === 'active' || inv.status === 'matured',
  );
  const cashedOutInvestments = investments.filter(
    inv => inv.status === 'cashed_out',
  );

  // Calculate totals for active/matured investments only
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.investedAmount,
    0,
  );
  const totalCurrentValue = activeInvestments.reduce(
    (sum, inv) => sum + inv.currentValue,
    0,
  );

  // For cashed-out investments, calculate the total returns they generated
  const cashedOutReturns = cashedOutInvestments.reduce((sum, inv) => {
    if (inv.cashOutDetails && inv.cashOutDetails.finalAmount) {
      // Returns = what was received - what was invested
      return sum + (inv.cashOutDetails.finalAmount - inv.investedAmount);
    }
    // If no cashOutDetails, use currentValue at time of cashout
    return sum + (inv.currentValue - inv.investedAmount);
  }, 0);

  // Total returns = current gains from active investments + returns from cashed-out investments
  const activeReturns =
    totalCurrentValue -
    activeInvestments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalReturns = activeReturns + cashedOutReturns;
  const activeInvestmentsCount = investments.filter(
    inv => inv.status === 'active',
  ).length;

  return {
    totalInvested,
    totalCurrentValue,
    totalReturns,
    activeInvestments: activeInvestmentsCount,
    totalInvestments: investments.length,
  };
};

// Instance method to calculate days left
investmentSchema.methods.getDaysLeft = function () {
  const now = new Date();
  const maturity = new Date(this.maturityDate);
  const diffTime = maturity - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Instance method to add hourly return
investmentSchema.methods.addHourlyReturn = function (
  returnAmount,
  returnPercentage,
) {
  this.hourlyReturns.push({
    returnAmount,
    returnPercentage,
  });

  // Update current value and total returns
  this.currentValue += returnAmount;
  this.totalReturns = this.currentValue - this.investedAmount;
  this.lastUpdated = new Date();

  // Keep only last 30 days of hourly returns (720 hours)
  if (this.hourlyReturns.length > 720) {
    this.hourlyReturns = this.hourlyReturns.slice(-720);
  }

  return this.save();
};

module.exports = mongoose.model('Investment', investmentSchema);
