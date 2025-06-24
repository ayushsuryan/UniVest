#!/usr/bin/env node

/**
 * Test Script: API Referral Signup Bonus
 * 
 * This script tests the registration API endpoint with referral code:
 * 1. Start the server
 * 2. Create a referrer user
 * 3. Register a new user with referral code
 * 4. Verify the response contains bonus information
 */

const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Test configuration
const TEST_CONFIG = {
  SERVER_URL: 'http://localhost:5000',
  REFERRER_EMAIL: 'api-referrer-test@example.com',
  REFERRED_EMAIL: 'api-referred-test@example.com',
  PASSWORD: 'test123456',
  EXPECTED_BONUS: parseInt(process.env.REFERRAL_SIGNUP_BONUS) || 250,
};

// Helper function to create user directly in database
async function createReferrer() {
  try {
    // Delete existing user if exists
    await User.deleteOne({ email: TEST_CONFIG.REFERRER_EMAIL });
    
    const user = await User.create({
      firstName: 'John',
      lastName: 'Referrer',
      email: TEST_CONFIG.REFERRER_EMAIL,
      password: TEST_CONFIG.PASSWORD,
      isEmailVerified: true,
    });
    
    console.log(`✅ Created referrer user: ${user.email}`);
    console.log(`   - Referral Code: ${user.referralCode}`);
    
    return user;
  } catch (error) {
    console.error(`❌ Error creating referrer:`, error.message);
    throw error;
  }
}

// Helper function to register user via API
async function registerUserWithReferral(referralCode) {
  try {
    const response = await axios.post(`${TEST_CONFIG.SERVER_URL}/api/auth/register`, {
      firstName: 'Jane',
      lastName: 'Referred',
      email: TEST_CONFIG.REFERRED_EMAIL,
      password: TEST_CONFIG.PASSWORD,
      referralCode: referralCode,
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ API registration failed:', error.response?.data || error.message);
    throw error;
  }
}

// Helper function to check if server is running
async function checkServerStatus() {
  try {
    const response = await axios.get(`${TEST_CONFIG.SERVER_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main test function
async function testAPIReferralSignupBonus() {
  console.log('🚀 Testing API Referral Signup Bonus\n');
  console.log('=' .repeat(50));
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');
    
    // Check if server is running
    console.log('\n🔍 Checking if server is running...');
    const serverRunning = await checkServerStatus();
    
    if (!serverRunning) {
      console.log('⚠️  Server is not running. Please start the server first:');
      console.log('   npm run dev');
      console.log('   or');
      console.log('   node server.js');
      process.exit(1);
    }
    
    console.log('✅ Server is running');
    
    // Step 1: Create referrer user
    console.log('\n👤 STEP 1: Creating Referrer User');
    console.log('-'.repeat(35));
    const referrer = await createReferrer();
    
    // Step 2: Register referred user via API
    console.log('\n🌐 STEP 2: Registering Referred User via API');
    console.log('-'.repeat(45));
    console.log(`🎯 Using referral code: ${referrer.referralCode}`);
    
    const registrationResponse = await registerUserWithReferral(referrer.referralCode);
    
    console.log('✅ Registration successful!');
    console.log(`   - Success: ${registrationResponse.success}`);
    console.log(`   - Message: ${registrationResponse.message}`);
    console.log(`   - Referral Bonus: ${registrationResponse.referralBonus}`);
    console.log(`   - User Balance: ₹${registrationResponse.user.balance}`);
    
    // Step 3: Verify the response
    console.log('\n🔍 STEP 3: Verifying API Response');
    console.log('-'.repeat(35));
    
    const expectedBalance = 1000 + TEST_CONFIG.EXPECTED_BONUS;
    const actualBalance = registrationResponse.user.balance;
    const bonusReceived = registrationResponse.referralBonus;
    const messageContainsBonus = registrationResponse.message.includes('₹250 signup bonus');
    
    console.log(`Expected Balance: ₹${expectedBalance}`);
    console.log(`Actual Balance: ₹${actualBalance}`);
    console.log(`Bonus Flag: ${bonusReceived}`);
    console.log(`Message Contains Bonus: ${messageContainsBonus}`);
    
    // Step 4: Verify in database
    console.log('\n💾 STEP 4: Verifying in Database');
    console.log('-'.repeat(35));
    
    const dbUser = await User.findOne({ email: TEST_CONFIG.REFERRED_EMAIL });
    console.log(`Database Balance: ₹${dbUser.balance}`);
    console.log(`Has Referrer: ${dbUser.referredBy ? 'Yes' : 'No'}`);
    console.log(`Referral Code Used: ${dbUser.referredByCode || 'None'}`);
    
    // Test Results Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    const tests = {
      balanceCorrect: actualBalance === expectedBalance,
      bonusFlagSet: bonusReceived === true,
      messageContainsBonus: messageContainsBonus,
      databaseBalanceCorrect: dbUser.balance === expectedBalance,
      hasReferrer: !!dbUser.referredBy,
    };
    
    console.log(`\n✅ API RESPONSE TESTS:`);
    console.log(`   Balance Correct: ${tests.balanceCorrect ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Bonus Flag Set: ${tests.bonusFlagSet ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Message Contains Bonus: ${tests.messageContainsBonus ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log(`\n✅ DATABASE TESTS:`);
    console.log(`   Database Balance Correct: ${tests.databaseBalanceCorrect ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Has Referrer: ${tests.hasReferrer ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allTestsPassed = Object.values(tests).every(test => test === true);
    
    console.log(`\n🎉 OVERALL TEST STATUS: ${
      allTestsPassed ? '✅ ALL TESTS PASSED - API working correctly!' : '❌ SOME TESTS FAILED'
    }`);
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: TEST_CONFIG.REFERRER_EMAIL });
    await User.deleteOne({ email: TEST_CONFIG.REFERRED_EMAIL });
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
    
    // Cleanup on error
    try {
      await User.deleteOne({ email: TEST_CONFIG.REFERRER_EMAIL });
      await User.deleteOne({ email: TEST_CONFIG.REFERRED_EMAIL });
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError.message);
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
    process.exit(0);
  }
}

// Run the test
if (require.main === module) {
  testAPIReferralSignupBonus().catch(console.error);
}

module.exports = { testAPIReferralSignupBonus }; 