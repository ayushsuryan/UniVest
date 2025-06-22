const User = require('../models/User');
const Referral = require('../models/Referral');
const mongoose = require('mongoose');

class ReferralService {
  // Process referral earnings when an investment generates hourly returns
  static async processReferralEarning(investment, hourlyReturn, assetName) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the user who made the investment
      const investor = await User.findById(investment.user).session(session);

      if (!investor || !investor.referredBy) {
        await session.commitTransaction();
        return null; // No referrer, no earnings
      }

      // Get the referrer
      const referrer = await User.findById(investor.referredBy).session(
        session,
      );

      if (!referrer) {
        await session.commitTransaction();
        return null;
      }

      // Calculate referral earning based on tier
      const tierPercentage = referrer.getReferralTierPercentage();
      const referralEarning = (hourlyReturn * tierPercentage) / 100;

      // Update referrer's referral balance
      referrer.referralBalance += referralEarning;
      await referrer.save({ session });

      // Find or create referral relationship record
      let referralRecord = await Referral.findOne({
        referrer: referrer._id,
        referred: investor._id,
      }).session(session);

      if (!referralRecord) {
        referralRecord = new Referral({
          referrer: referrer._id,
          referred: investor._id,
          referralCode: investor.referredByCode || referrer.referralCode,
          status: 'active',
        });
      }

      // Add earning to referral record
      await referralRecord.addEarning(
        referralEarning,
        investment._id,
        assetName,
        hourlyReturn,
        tierPercentage,
      );

      await session.commitTransaction();

      return {
        referrerId: referrer._id,
        referralEarning,
        tierPercentage,
        referrerTier: referrer.referralTier,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Error processing referral earning:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Apply referral code during signup
  static async applyReferralCode(newUserId, referralCode) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find referrer by code
      const referrer = await User.findOne({ referralCode }).session(session);

      if (!referrer) {
        await session.abortTransaction();
        return { success: false, message: 'Invalid referral code' };
      }

      // Update new user with referrer info
      const newUser = await User.findById(newUserId).session(session);
      newUser.referredBy = referrer._id;
      newUser.referredByCode = referralCode;
      await newUser.save({ session });

      // Increment referrer's count and update tier
      referrer.referralCount += 1;
      referrer.updateReferralTier();
      await referrer.save({ session });

      // Create referral relationship record
      const referralRecord = new Referral({
        referrer: referrer._id,
        referred: newUserId,
        referralCode: referralCode,
        status: 'pending',
      });
      await referralRecord.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        referrerId: referrer._id,
        newTier: referrer.referralTier,
        totalReferrals: referrer.referralCount,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Error applying referral code:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Get referral team and analytics
  static async getReferralTeamData(userId) {
    try {
      // Get user's current tier and stats
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get all referrals
      const referrals = await Referral.getReferrerTeam(userId);

      // Get analytics
      const analytics = await Referral.getReferralAnalytics(userId);

      // Calculate tier progress
      const tierProgress = this.calculateTierProgress(user.referralCount);

      // Format team members data
      const teamMembers = referrals.map(referral => ({
        id: referral.referred._id,
        name: `${referral.referred.firstName} ${referral.referred.lastName}`,
        email: referral.referred.email,
        joinDate: referral.signupDate,
        status: referral.status,
        earnings: referral.totalEarnings,
        reward: 250, // Sign-up bonus
        lastActive: referral.lastActiveDate,
      }));

      return {
        user: {
          referralCode: user.referralCode,
          referralBalance: user.referralBalance,
          tier: user.referralTier,
          referralCount: user.referralCount,
        },
        analytics: {
          ...analytics,
          tierProgress,
        },
        teamMembers,
      };
    } catch (error) {
      console.error('Error getting referral team data:', error);
      throw error;
    }
  }

  // Calculate tier progress
  static calculateTierProgress(referralCount) {
    let nextTierRequirement;
    let currentTierMin;
    let nextTier;

    if (referralCount < 5) {
      currentTierMin = 0;
      nextTierRequirement = 5;
      nextTier = 'silver';
    } else if (referralCount < 12) {
      currentTierMin = 5;
      nextTierRequirement = 12;
      nextTier = 'gold';
    } else if (referralCount < 25) {
      currentTierMin = 12;
      nextTierRequirement = 25;
      nextTier = 'diamond';
    } else {
      // Already diamond
      return {
        percentage: 100,
        current: referralCount,
        required: 25,
        nextTier: 'diamond',
        isMaxTier: true,
      };
    }

    const progress =
      ((referralCount - currentTierMin) /
        (nextTierRequirement - currentTierMin)) *
      100;

    return {
      percentage: Math.min(progress, 100),
      current: referralCount,
      required: nextTierRequirement,
      nextTier,
      isMaxTier: false,
    };
  }

  // Get referral earnings history
  static async getReferralEarnings(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Get all referral records for this referrer
      const referrals = await Referral.find({ referrer: userId });

      // Flatten all earnings and sort by date
      let allEarnings = [];
      referrals.forEach(referral => {
        referral.earnings.forEach(earning => {
          allEarnings.push({
            ...earning.toObject(),
            referredUser: referral.referred,
            referralId: referral._id,
          });
        });
      });

      // Sort by timestamp descending
      allEarnings.sort((a, b) => b.timestamp - a.timestamp);

      // Paginate
      const totalEarnings = allEarnings.length;
      const paginatedEarnings = allEarnings.slice(skip, skip + limit);

      // Populate referred user details
      const populatedEarnings = await Promise.all(
        paginatedEarnings.map(async earning => {
          const user = await User.findById(earning.referredUser).select(
            'firstName lastName email',
          );
          return {
            ...earning,
            referredUser: user
              ? `${user.firstName} ${user.lastName}`
              : 'Unknown User',
            referredEmail: user ? user.email : '',
          };
        }),
      );

      return {
        earnings: populatedEarnings,
        pagination: {
          total: totalEarnings,
          page,
          limit,
          pages: Math.ceil(totalEarnings / limit),
        },
      };
    } catch (error) {
      console.error('Error getting referral earnings:', error);
      throw error;
    }
  }

  // Withdraw referral balance
  static async withdrawReferralBalance(userId, amount) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);

      if (!user) {
        throw new Error('User not found');
      }

      if (amount > user.referralBalance) {
        throw new Error('Insufficient referral balance');
      }

      // Transfer from referral balance to main balance
      user.referralBalance -= amount;
      user.balance += amount;
      await user.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        newReferralBalance: user.referralBalance,
        newMainBalance: user.balance,
        transferredAmount: amount,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Error withdrawing referral balance:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Monthly job to reset monthly earnings
  static async resetMonthlyEarnings() {
    try {
      const referrals = await Referral.find({});

      for (const referral of referrals) {
        await referral.resetMonthlyEarnings();
      }

      console.log(
        `Reset monthly earnings for ${referrals.length} referral records`,
      );
      return { success: true, recordsUpdated: referrals.length };
    } catch (error) {
      console.error('Error resetting monthly earnings:', error);
      throw error;
    }
  }
}

module.exports = ReferralService;
