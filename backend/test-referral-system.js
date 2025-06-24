#!/usr/bin/env node

/**
 * Comprehensive Referral System Test Script
 * 
 * This script tests the complete referral flow:
 * 1. Create referrer user (gets referral code)
 * 2. Create referred user with referral code
 * 3. Verify initial balances (1000 each)
 * 4. Referred user makes first investment
 * 5. Verify signup bonus is awarded (referrer: 1000 → 1250)
 * 6. Wait for cron job to process ongoing earnings
 * 7. Verify ongoing earnings are being paid
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models and services
const User = require('./models/User');
const Asset = require('./models/Asset');
const Investment = require('./models/Investment');
const Referral = require('./models/Referral');
const ReferralService = require('./services/referralService');
const { calculateHourlyReturns } = require('./jobs/hourlyReturns');

// Test configuration
const TEST_CONFIG = {
  REFERRER_EMAIL: 'referrer@test.com',
  REFERRED_EMAIL: 'referred@test.com',
  PASSWORD: 'test123456',
  INVESTMENT_AMOUNT: 500, // Amount to invest
  WAIT_TIME: 65000, // Wait 65 seconds for cron processing
};

// Helper function to create user
async function createTestUser(userData) {
  try {
    // Delete existing user if exists
    await User.deleteOne({ email: userData.email });
    
    const user = await User.create(userData);
    console.log(`✅ Created user: ${userData.email} (ID: ${user._id})`);
    console.log(`   - Balance: ₹${user.balance}`);
    console.log(`   - Referral Code: ${user.referralCode}`);
    console.log(`   - Referral Balance: ₹${user.referralBalance}`);
    
    return user;
  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error.message);
    throw error;
  }
}

// Helper function to get or create test asset
async function getTestAsset() {
  try {
    let asset = await Asset.findOne({ name: 'Test Gold' });
    
    if (!asset) {
      // Create a dummy admin user for asset creation if needed
      let adminUser = await User.findOne({ email: 'admin@test.com' });
      if (!adminUser) {
        adminUser = await User.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin1@test.com',
          password: 'admin123456',
          isEmailVerified: true,
        });
      }
      
      asset = await Asset.create({
        name: 'Test Gold',
        category: 'Precious Metals',
        price: 1000,
        image: 'https://example.com/gold.jpg',
        description: 'Test asset for referral system testing',
        hourlyReturnPercentage: 20, // 2% per hour for faster testing
        hourlyReturnReferralPercentage: 1.0, // 1% referral return
        maturityPeriod: '30 days',
        minInvestment: 100,
        maxInvestment: 10000,
        isActive: true,
        totalInvestors: 0,
        totalInvestmentAmount: 0,
        createdBy: adminUser._id, // Required field
      });
      console.log(`✅ Created test asset: ${asset.name} (ID: ${asset._id})`);
    } else {
      console.log(`✅ Using existing test asset: ${asset.name} (ID: ${asset._id})`);
    }
    
    console.log(`   - Hourly Return: ${asset.hourlyReturnPercentage}%`);
    console.log(`   - Min Investment: ₹${asset.minInvestment}`);
    
    return asset;
  } catch (error) {
    console.error('❌ Error getting test asset:', error.message);
    throw error;
  }
}

// Helper function to check user balances
async function checkBalances(referrer, referred, step) {
  const updatedReferrer = await User.findById(referrer._id);
  const updatedReferred = await User.findById(referred._id);
  
  console.log(`\n📊 ${step} - Balance Check:`);
  console.log(`   Referrer (${referrer.email}):`);
  console.log(`     - Main Balance: ₹${updatedReferrer.balance}`);
  console.log(`     - Referral Balance: ₹${updatedReferrer.referralBalance}`);
  console.log(`     - Total: ₹${updatedReferrer.balance + updatedReferrer.referralBalance}`);
  console.log(`   Referred (${referred.email}):`);
  console.log(`     - Main Balance: ₹${updatedReferred.balance}`);
  console.log(`     - Referral Balance: ₹${updatedReferred.referralBalance}`);
  console.log(`     - Total: ₹${updatedReferred.balance + updatedReferred.referralBalance}`);
  
  return { referrer: updatedReferrer, referred: updatedReferred };
}

// Helper function to check referral status
async function checkReferralStatus(referrerId, referredId) {
  const referral = await Referral.findOne({
    referrer: referrerId,
    referred: referredId,
  });
  
  if (referral) {
    console.log(`\n🔍 Referral Status:`);
    console.log(`   - Status: ${referral.status}`);
    console.log(`   - Total Earnings: ₹${referral.totalEarnings}`);
    console.log(`   - Monthly Earnings: ₹${referral.monthlyEarnings}`);
    console.log(`   - Earnings Count: ${referral.earnings.length}`);
    if (referral.firstInvestmentDate) {
      console.log(`   - First Investment Date: ${referral.firstInvestmentDate}`);
    }
  }
  
  return referral;
}

// Main test function
async function runReferralTest() {
  console.log('🚀 Starting Comprehensive Referral System Test\n');
  console.log('=' .repeat(60));
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully\n');
    
    // Step 1: Create referrer user
    console.log('👤 STEP 1: Creating Referrer User');
    console.log('-'.repeat(40));
    const referrer = await createTestUser({
      firstName: 'John',
      lastName: 'Referrer',
      email: TEST_CONFIG.REFERRER_EMAIL,
      password: TEST_CONFIG.PASSWORD,
      isEmailVerified: true,
    });
    
    // Step 2: Create referred user with referral code
    console.log('\n👤 STEP 2: Creating Referred User with Referral Code');
    console.log('-'.repeat(50));
    const referred = await createTestUser({
      firstName: 'Jane',
      lastName: 'Referred',
      email: TEST_CONFIG.REFERRED_EMAIL,
      password: TEST_CONFIG.PASSWORD,
      isEmailVerified: true,
    });
    
    // Apply referral code
    console.log(`\n🔗 Applying referral code: ${referrer.referralCode}`);
    const referralResult = await ReferralService.applyReferralCode(
      referred._id,
      referrer.referralCode
    );
    
    if (referralResult.success) {
      console.log('✅ Referral code applied successfully');
      console.log(`   - New referrer tier: ${referralResult.newTier}`);
      console.log(`   - Total referrals: ${referralResult.totalReferrals}`);
    } else {
      throw new Error(`Failed to apply referral code: ${referralResult.message}`);
    }
    
    // Step 3: Check initial balances
    console.log('\n💰 STEP 3: Initial Balance Check');
    console.log('-'.repeat(35));
    await checkBalances(referrer, referred, 'Initial State');
    await checkReferralStatus(referrer._id, referred._id);
    
    // Step 4: Get test asset
    console.log('\n🏆 STEP 4: Getting Test Asset');
    console.log('-'.repeat(30));
    const asset = await getTestAsset();
    
    // Step 5: Create investment for referred user
    console.log('\n💎 STEP 5: Creating Investment for Referred User');
    console.log('-'.repeat(45));
    
    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + 30);
    
    const investment = await Investment.create({
      user: referred._id,
      asset: asset._id,
      investedAmount: TEST_CONFIG.INVESTMENT_AMOUNT,
      currentValue: TEST_CONFIG.INVESTMENT_AMOUNT,
      maturityDate,
    });
    
    console.log(`✅ Investment created: ₹${TEST_CONFIG.INVESTMENT_AMOUNT}`);
    console.log(`   - Investment ID: ${investment._id}`);
    console.log(`   - Asset: ${asset.name}`);
    console.log(`   - Maturity Date: ${maturityDate.toDateString()}`);
    
    // Update referred user balance
    const updatedReferred = await User.findById(referred._id);
    updatedReferred.balance -= TEST_CONFIG.INVESTMENT_AMOUNT;
    await updatedReferred.save();
    console.log(`   - Deducted ₹${TEST_CONFIG.INVESTMENT_AMOUNT} from user balance`);
    
    // Activate referral on first investment
    console.log('\n🎯 Activating referral on first investment...');
    const activationResult = await ReferralService.activateReferralOnFirstInvestment(referred._id);
    
    if (activationResult && activationResult.success) {
      console.log('✅ Referral activated successfully');
      console.log(`   - Status: ${activationResult.status}`);
      console.log(`   - Signup bonus awarded: ₹${activationResult.signupBonusAwarded}`);
    } else {
      console.log('⚠️  No referral activation (user might not have been referred)');
    }
    
    // Step 6: Check balances after activation
    console.log('\n💰 STEP 6: Balance Check After Activation');
    console.log('-'.repeat(40));
    const balancesAfterActivation = await checkBalances(referrer, referred, 'After Activation');
    await checkReferralStatus(referrer._id, referred._id);
    
    // Verify signup bonus
    const expectedReferrerBalance = 1000 + (parseInt(process.env.REFERRAL_SIGNUP_BONUS) || 0);
    if (balancesAfterActivation.referrer.balance + balancesAfterActivation.referrer.referralBalance >= expectedReferrerBalance) {
      console.log('✅ Signup bonus verification PASSED');
    } else {
      console.log('❌ Signup bonus verification FAILED');
    }
    
    // Step 7: Run cron job manually to process ongoing earnings
    console.log('\n⏰ STEP 7: Processing Ongoing Earnings (Cron Job Simulation)');
    console.log('-'.repeat(55));
    
    console.log('🔄 Running hourly returns calculation...');
    await calculateHourlyReturns();
    console.log('✅ First cron run completed');
    
    // Wait a bit and run again to simulate ongoing earnings
    console.log(`\n⏳ Waiting ${TEST_CONFIG.WAIT_TIME / 1000} seconds for more earnings...`);
    
    // Run cron job multiple times to simulate ongoing earnings
    for (let i = 1; i <= 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
      console.log(`\n🔄 Running cron job ${i + 1}/4...`);
      await calculateHourlyReturns();
      
      // Check balances after each run
      const currentBalances = await checkBalances(referrer, referred, `After Cron Run ${i + 1}`);
      await checkReferralStatus(referrer._id, referred._id);
    }
    
    // Step 8: Final verification
    console.log('\n🎯 STEP 8: Final Verification');
    console.log('-'.repeat(30));
    
    const finalBalances = await checkBalances(referrer, referred, 'Final State');
    const finalReferral = await checkReferralStatus(referrer._id, referred._id);
    
    // Get investment details
    const updatedInvestment = await Investment.findById(investment._id);
    console.log(`\n📈 Investment Progress:`);
    console.log(`   - Original Amount: ₹${updatedInvestment.investedAmount}`);
    console.log(`   - Current Value: ₹${updatedInvestment.currentValue.toFixed(2)}`);
    console.log(`   - Total Returns: ₹${updatedInvestment.totalReturns.toFixed(2)}`);
    console.log(`   - Return Entries: ${updatedInvestment.hourlyReturns.length}`);
    
    // Test Results Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const initialReferrerTotal = 1000;
    const finalReferrerTotal = finalBalances.referrer.balance + finalBalances.referrer.referralBalance;
    const signupBonus = parseInt(process.env.REFERRAL_SIGNUP_BONUS) || 0;
    
    console.log(`\n✅ SIGNUP BONUS TEST:`);
    console.log(`   Expected: ₹${initialReferrerTotal + signupBonus}`);
    console.log(`   Actual: ₹${finalReferrerTotal}`);
    console.log(`   Status: ${finalReferrerTotal >= initialReferrerTotal + signupBonus ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log(`\n✅ ONGOING EARNINGS TEST:`);
    console.log(`   Referral Status: ${finalReferral ? finalReferral.status : 'Not Found'}`);
    console.log(`   Total Earnings: ₹${finalReferral ? finalReferral.totalEarnings.toFixed(4) : '0'}`);
    console.log(`   Earnings Entries: ${finalReferral ? finalReferral.earnings.length : 0}`);
    console.log(`   Status: ${finalReferral && finalReferral.totalEarnings > signupBonus ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log(`\n✅ INVESTMENT GROWTH TEST:`);
    console.log(`   Investment Returns: ₹${updatedInvestment.totalReturns.toFixed(4)}`);
    console.log(`   Status: ${updatedInvestment.totalReturns > 0 ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log(`\n🎉 OVERALL TEST STATUS: ${
      finalReferrerTotal >= initialReferrerTotal + signupBonus &&
      finalReferral && finalReferral.totalEarnings > signupBonus &&
      updatedInvestment.totalReturns > 0
        ? '✅ ALL TESTS PASSED'
        : '❌ SOME TESTS FAILED'
    }`);
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cleanup and close connection
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      await User.deleteOne({ email: TEST_CONFIG.REFERRER_EMAIL });
      await User.deleteOne({ email: TEST_CONFIG.REFERRED_EMAIL });
      await User.deleteOne({ email: 'admin@test.com' }); // Clean up admin user
      await Investment.deleteMany({ 
        user: { $in: [
          await User.findOne({ email: TEST_CONFIG.REFERRER_EMAIL })?.select('_id'),
          await User.findOne({ email: TEST_CONFIG.REFERRED_EMAIL })?.select('_id')
        ].filter(Boolean) }
      });
      await Referral.deleteMany({
        $or: [
          { referrer: await User.findOne({ email: TEST_CONFIG.REFERRER_EMAIL })?.select('_id') },
          { referred: await User.findOne({ email: TEST_CONFIG.REFERRED_EMAIL })?.select('_id') }
        ].filter(Boolean)
      });
      // Clean up test asset
      await Asset.deleteOne({ name: 'Test Gold' });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.log('⚠️  Cleanup completed (some data may remain)');
    }
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    console.log('\n🏁 Test completed!');
  }
}

// Run the test
if (require.main === module) {
  runReferralTest().catch(console.error);
}

module.exports = { runReferralTest }; 