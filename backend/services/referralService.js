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

      // Find referral relationship record
      let referralRecord = await Referral.findOne({
        referrer: referrer._id,
        referred: investor._id,
      }).session(session);

      // ✅ CRITICAL FIX: Only process earnings for ACTIVE referrals
      if (!referralRecord) {
        await session.commitTransaction();
        return null; // No referral record found, no earnings
      }

      // ✅ CRITICAL FIX: Check if referral is active before processing earnings
      if (referralRecord.status !== 'active') {
        await session.commitTransaction();
        console.log(`⏸️  Skipping referral earning - referral status is '${referralRecord.status}' (not active) for user ${investor._id}`);
        return null; // Only active referrals earn money
      }

      // Calculate referral earning based on tier
      const tierPercentage = referrer.getReferralTierPercentage();
      const referralEarning = (hourlyReturn * tierPercentage) / 100;

      // Update referrer's referral balance
      referrer.referralBalance += referralEarning;
      await referrer.save({ session });

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
      
      // Award immediate signup bonus to the referred user
      const SIGNUP_BONUS = parseInt(process.env.REFERRAL_SIGNUP_BONUS) || 250;
      if (SIGNUP_BONUS > 0) {
        newUser.balance += SIGNUP_BONUS;
        console.log(`🎁 Signup bonus of ₹${SIGNUP_BONUS} awarded to referred user ${newUser._id}`);
      }
      
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

      // Record the signup bonus as an earning in the referral record
      if (SIGNUP_BONUS > 0) {
        await referralRecord.addEarning(
          SIGNUP_BONUS,
          null, // No specific investment
          'Signup Bonus (Referred User)',
          SIGNUP_BONUS,
          100, // 100% bonus
        );
      }

      await session.commitTransaction();

      return {
        success: true,
        referrerId: referrer._id,
        newTier: referrer.referralTier,
        totalReferrals: referrer.referralCount,
        signupBonusAwarded: SIGNUP_BONUS,
        message: SIGNUP_BONUS > 0 ? `Welcome! You've received a ₹${SIGNUP_BONUS} signup bonus!` : 'Referral code applied successfully',
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

  // Activate referral on first investment
  static async activateReferralOnFirstInvestment(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the user who made the investment
      const investor = await User.findById(userId).session(session);

      if (!investor || !investor.referredBy) {
        await session.commitTransaction();
        return null; // No referrer, nothing to activate
      }

      // Get the referrer
      const referrer = await User.findById(investor.referredBy).session(session);

      if (!referrer) {
        await session.commitTransaction();
        return null;
      }

      // Find referral relationship record
      let referralRecord = await Referral.findOne({
        referrer: investor.referredBy,
        referred: userId,
      }).session(session);

      if (!referralRecord) {
        await session.commitTransaction();
        return null; // No referral record found
      }

      // Only activate if currently pending
      if (referralRecord.status === 'pending') {
        referralRecord.status = 'active';
        referralRecord.firstInvestmentDate = new Date();
        referralRecord.lastActiveDate = new Date();
        await referralRecord.save({ session });

        // Optional: Give signup bonus to referrer (configurable)
        const SIGNUP_BONUS = parseInt(process.env.REFERRAL_SIGNUP_BONUS) || 0;
        if (SIGNUP_BONUS > 0) {
          referrer.referralBalance += SIGNUP_BONUS;
          await referrer.save({ session });

          // Record the signup bonus as an earning
          await referralRecord.addEarning(
            SIGNUP_BONUS,
            null, // No specific investment
            'Signup Bonus',
            SIGNUP_BONUS,
            100, // 100% bonus
          );

          console.log(`💰 Signup bonus of ₹${SIGNUP_BONUS} awarded to referrer ${referrer._id}`);
        }

        console.log(`🎯 Referral activated: User ${userId} made their first investment`);
      }

      await session.commitTransaction();

      return {
        success: true,
        referralId: referralRecord._id,
        status: referralRecord.status,
        referrerId: investor.referredBy,
        signupBonusAwarded: parseInt(process.env.REFERRAL_SIGNUP_BONUS) || 0,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Error activating referral on first investment:', error);
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
