const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ReferralService = require('../services/referralService');

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

module.exports = router;
