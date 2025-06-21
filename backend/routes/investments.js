const express = require('express');
const rateLimit = require('express-rate-limit');
const Investment = require('../models/Investment');
const Asset = require('../models/Asset');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for investment endpoints
const investmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 investment requests per windowMs
  message: {
    success: false,
    message: 'Too many investment requests, please try again later.'
  }
});

// @desc    Create new investment
// @route   POST /api/investments
// @access  Private
router.post('/', protect, investmentLimiter, asyncHandler(async (req, res) => {
  const { assetId, amount } = req.body;

  // Validate input
  if (!assetId || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Asset ID and investment amount are required'
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Investment amount must be greater than 0'
    });
  }

  // Find asset
  const asset = await Asset.findById(assetId);
  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Asset not found'
    });
  }

  if (!asset.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Asset is not available for investment'
    });
  }

  // Check minimum investment
  if (amount < asset.minInvestment) {
    return res.status(400).json({
      success: false,
      message: `Minimum investment amount is ₹${asset.minInvestment}`
    });
  }

  // Get user with balance
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check user balance
  if (user.balance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance'
    });
  }

  // Calculate maturity date based on maturity period
  const maturityDate = new Date();
  const maturityPeriodDays = parseInt(asset.maturityPeriod.replace(/\D/g, '')) || 30;
  maturityDate.setDate(maturityDate.getDate() + maturityPeriodDays);

  // Create investment
  const investment = await Investment.create({
    user: req.user._id,
    asset: assetId,
    investedAmount: amount,
    currentValue: amount,
    maturityDate
  });

  // Deduct amount from user balance
  user.balance -= amount;
  await user.save();

  // Update asset statistics
  asset.totalInvestors += 1;
  asset.totalInvestmentAmount += amount;
  await asset.save();

  // Populate investment with asset details
  await investment.populate('asset', 'name category image price hourlyReturnPercentage maturityPeriod');

  res.status(201).json({
    success: true,
    message: 'Investment created successfully',
    data: investment
  });
}));

// @desc    Get user investments
// @route   GET /api/investments
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const investments = await Investment.getUserInvestments(req.user._id, status);
  
  // Add calculated fields
  const investmentsWithCalcs = investments.map(investment => {
    const investmentObj = investment.toObject();
    investmentObj.daysLeft = investment.getDaysLeft();
    investmentObj.returnPercentage = investment.investedAmount > 0 
      ? ((investment.totalReturns / investment.investedAmount) * 100).toFixed(2)
      : '0.00';
    return investmentObj;
  });

  res.status(200).json({
    success: true,
    count: investments.length,
    data: investmentsWithCalcs
  });
}));

// @desc    Get user portfolio statistics
// @route   GET /api/investments/portfolio-stats
// @access  Private
router.get('/portfolio-stats', protect, asyncHandler(async (req, res) => {
  const stats = await Investment.getUserPortfolioStats(req.user._id);
  
  // Get user for referral stats (placeholder for now)
  const user = await User.findById(req.user._id);
  
  const portfolioStats = {
    ...stats,
    balance: user.balance,
    referralBalance: 0, // TODO: Implement referral system
    referredUsers: 0 // TODO: Implement referral system
  };

  res.status(200).json({
    success: true,
    data: portfolioStats
  });
}));

// @desc    Cash out investment early
// @route   POST /api/investments/:id/cash-out
// @access  Private
router.post('/:id/cash-out', protect, asyncHandler(async (req, res) => {
  // Find investment
  const investment = await Investment.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('asset');

  if (!investment) {
    return res.status(404).json({
      success: false,
      message: 'Investment not found'
    });
  }

  if (investment.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Investment is not active'
    });
  }

  // Check if already matured
  if (investment.getDaysLeft() <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Investment has already matured. Please use regular cash out.'
    });
  }

  // Calculate penalty
  const { penaltyAmount, finalAmount } = investment.calculateCashOutPenalty();

  // Update investment
  investment.status = 'cashed_out';
  investment.cashOutDetails = {
    cashOutDate: new Date(),
    penaltyAmount,
    finalAmount
  };
  await investment.save();

  // Add amount back to user balance
  const user = await User.findById(req.user._id);
  user.balance += finalAmount;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Investment cashed out successfully',
    data: {
      originalAmount: investment.currentValue,
      penaltyAmount,
      finalAmount,
      newBalance: user.balance
    }
  });
}));

// @desc    Get investment details
// @route   GET /api/investments/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const investment = await Investment.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('asset');

  if (!investment) {
    return res.status(404).json({
      success: false,
      message: 'Investment not found'
    });
  }

  const investmentObj = investment.toObject();
  investmentObj.daysLeft = investment.getDaysLeft();
  investmentObj.returnPercentage = investment.investedAmount > 0 
    ? ((investment.totalReturns / investment.investedAmount) * 100).toFixed(2)
    : '0.00';

  res.status(200).json({
    success: true,
    data: investmentObj
  });
}));

module.exports = router; 