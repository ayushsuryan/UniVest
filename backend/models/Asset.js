const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    maxlength: [100, 'Asset name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Asset price is required'],
    min: [0, 'Price cannot be negative']
  },
  maturityPeriod: {
    type: String,
    required: [true, 'Maturity period is required'],
    trim: true
  },
  hourlyReturnPercentage: {
    type: Number,
    required: [true, 'Hourly return percentage is required'],
    min: [0, 'Hourly return percentage cannot be negative'],
    max: [100, 'Hourly return percentage cannot exceed 100%']
  },
  image: {
    type: String,
    required: [true, 'Asset image is required'],
    trim: true
  },
  hourlyReturnReferralPercentage: {
    type: Number,
    required: [true, 'Hourly return referral percentage is required'],
    min: [0, 'Referral percentage cannot be negative'],
    max: [100, 'Referral percentage cannot exceed 100%']
  },
  hourlyReturnHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    returnPercentage: {
      type: Number,
      required: true
    },
    totalInvestments: {
      type: Number,
      default: 0
    }
  }],
  // Additional fields for better asset management
  category: {
    type: String,
    required: [true, 'Asset category is required'],
    trim: true
  },
  minInvestment: {
    type: Number,
    required: [true, 'Minimum investment is required'],
    min: [0, 'Minimum investment cannot be negative']
  },
  currentDemand: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High'],
    default: 'Medium'
  },
  totalInvestors: {
    type: Number,
    default: 0
  },
  totalInvestmentAmount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
assetSchema.index({ category: 1 });
assetSchema.index({ isActive: 1 });
assetSchema.index({ createdAt: -1 });

// Static method to get active assets
assetSchema.statics.getActiveAssets = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to get assets by category
assetSchema.statics.getAssetsByCategory = function(category) {
  return this.find({ category: category, isActive: true }).sort({ createdAt: -1 });
};

// Instance method to add hourly return history
assetSchema.methods.addHourlyReturn = function(returnPercentage, totalInvestments = 0) {
  this.hourlyReturnHistory.push({
    returnPercentage,
    totalInvestments
  });
  
  // Keep only last 30 days of history (720 hours)
  if (this.hourlyReturnHistory.length > 720) {
    this.hourlyReturnHistory = this.hourlyReturnHistory.slice(-720);
  }
  
  return this.save();
};

module.exports = mongoose.model('Asset', assetSchema); 