const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ReferralService = require('../services/referralService');
const User = require('../models/User');

// Validate referral code (public endpoint for signup)
router.post('/validate-code', async (req, res) => {
  try {
    const { code } = req.body; // Accept 'code' parameter to match frontend

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required',
        data: {
          valid: false,
        },
      });
    }

    // Find referrer by code
    const referrer = await User.findOne({ referralCode: code.toUpperCase() });

    if (!referrer) {
      return res.status(200).json({
        success: true,
        message: 'Invalid referral code',
        data: {
          valid: false,
        },
      });
    }

    // Return success with referrer info
    res.json({
      success: true,
      message: 'Valid referral code',
      data: {
        valid: true,
        referrerName: `${referrer.firstName} ${referrer.lastName}`,
        referrerTier: referrer.referralTier,
      },
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code',
      data: {
        valid: false,
      },
      error: error.message,
    });
  }
});

// Get referral team data and analytics
router.get('/team', protect, async (req, res) => {
  try {
    const teamData = await ReferralService.getReferralTeamData(req.user.id);

    res.json({
      success: true,
      data: teamData,
    });
  } catch (error) {
    console.error('Error fetching team data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team data',
      error: error.message,
    });
  }
});

// Get referral earnings history
router.get('/earnings', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const earnings = await ReferralService.getReferralEarnings(
      req.user.id,
      page,
      limit,
    );

    res.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings history',
      error: error.message,
    });
  }
});

// Withdraw referral balance to main balance
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount',
      });
    }

    const result = await ReferralService.withdrawReferralBalance(
      req.user.id,
      amount,
    );

    res.json({
      success: true,
      data: result,
      message: `Successfully transferred ₹${amount} to your main balance`,
    });
  } catch (error) {
    console.error('Error withdrawing referral balance:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to withdraw referral balance',
    });
  }
});

// Apply referral code (usually called during signup)
router.post('/apply-code', protect, async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required',
      });
    }

    const result = await ReferralService.applyReferralCode(
      req.user.id,
      referralCode,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result,
      message: 'Referral code applied successfully',
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply referral code',
      error: error.message,
    });
  }
});

// Get referral statistics for dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    const teamData = await ReferralService.getReferralTeamData(req.user.id);

    // Extract just the stats for a summary view
    const stats = {
      referralCode: teamData.user.referralCode,
      tier: teamData.user.tier,
      referralBalance: teamData.user.referralBalance,
      totalMembers: teamData.analytics.totalMembers,
      activeMembers: teamData.analytics.activeMembers,
      totalEarnings: teamData.analytics.totalEarnings,
      monthlyEarnings: teamData.analytics.monthlyEarnings,
      tierProgress: teamData.analytics.tierProgress,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral statistics',
      error: error.message,
    });
  }
});

// Get complete referral dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const teamData = await ReferralService.getReferralTeamData(req.user.id);

    // Format the response to match frontend expectations
    const dashboardData = {
      referralCode: teamData.user.referralCode,
      totalReferrals: teamData.analytics.totalMembers,
      activeReferrals: teamData.analytics.activeMembers,
      pendingReferrals: teamData.analytics.pendingMembers,
      tier: teamData.user.tier,
      referralBalance: teamData.user.referralBalance,
      totalEarnings: teamData.analytics.totalEarnings,
      monthlyEarnings: teamData.analytics.monthlyEarnings,
      team: teamData.teamMembers.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        joinDate: member.joinDate,
        status: member.status,
        totalEarnings: member.earnings || 0,
        monthlyEarnings: 0, // Calculate if needed
        firstInvestmentDate: member.firstInvestmentDate,
      })),
      tierProgress: teamData.analytics.tierProgress,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching referral dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral dashboard',
      error: error.message,
    });
  }
});

module.exports = router;
