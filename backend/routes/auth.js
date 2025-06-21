const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, sendTokenResponse } = require('../middleware/auth');
const emailService = require('../services/emailService');
const OTPGenerator = require('../utils/otpGenerator');
const {
  validateRegistration,
  validateLogin,
  validateOTP,
  validateEmail,
  validatePasswordReset,
  validatePasswordChange,
  validateProfileUpdate
} = require('../utils/validators');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs (increased from 5)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 OTP requests per 5 minutes (increased from 3)
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later.'
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, validateRegistration, asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  
  console.log(`📝 Registration attempt for email: ${email}`);

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    console.log(`❌ Registration failed - User already exists: ${email}`);
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  try {
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone: phone || undefined
    });
    
    console.log(`✅ User created successfully: ${email}`);

    // Generate OTP for email verification
    const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
    const otpExpiry = parseInt(process.env.OTP_EXPIRES_IN) || 10;
    const otp = OTPGenerator.generateSecure(otpLength);

    // Save OTP to database
    await OTP.createOTP(email, 'email_verification', otp, otpExpiry);
    console.log(`📧 OTP generated for email: ${email}`);

    // Send verification email
    try {
      await emailService.sendOTP(email, otp, 'email_verification');
      console.log(`📬 Verification email sent to: ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails - just log it
    }

    const response = {
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      user: user.getPublicProfile()
    };
    
    console.log(`🎉 Registration successful for: ${email}`);
    res.status(201).json(response);
    
  } catch (error) {
    console.error(`❌ Registration error for ${email}:`, error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', validateOTP, asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find valid OTP
  const otpRecord = await OTP.findValidOTP(email, otp, 'email_verification');
  if (!otpRecord) {
    // Increment attempts
    await OTP.incrementAttempts(email, 'email_verification');
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
  }

  // Check attempts
  if (otpRecord.attempts >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
    });
  }

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Mark OTP as used
  await OTP.markAsUsed(email, otp, 'email_verification');

  // Update user email verification status
  user.isEmailVerified = true;
  await user.save();

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(email, user.firstName);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  // Send token response
  sendTokenResponse(user, 200, res, 'Email verified successfully. Welcome to Finance App!');
}));

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-verification-otp
// @access  Public
router.post('/resend-verification-otp', otpLimiter, validateEmail, asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate new OTP
  const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
  const otpExpiry = parseInt(process.env.OTP_EXPIRES_IN) || 10;
  const otp = OTPGenerator.generateSecure(otpLength);

  // Save OTP to database
  await OTP.createOTP(email, 'email_verification', otp, otpExpiry);

  // Send OTP email
  await emailService.sendOTP(email, otp, 'email_verification');

  res.status(200).json({
    success: true,
    message: 'Verification OTP sent successfully'
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated. Please contact support.'
    });
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    return res.status(401).json({
      success: false,
      message: 'Please verify your email address before logging in. Check your email for the verification code.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Send token response
  sendTokenResponse(user, 200, res, 'Login successful');
}));

// @desc    Forgot password - Send reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', otpLimiter, validateEmail, asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset code has been sent.'
    });
  }

  // Generate OTP
  const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
  const otpExpiry = parseInt(process.env.OTP_EXPIRES_IN) || 10;
  const otp = OTPGenerator.generateSecure(otpLength);

  // Save OTP to database
  await OTP.createOTP(email, 'password_reset', otp, otpExpiry);

  // Send OTP email
  try {
    await emailService.sendOTP(email, otp, 'password_reset');
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send password reset email'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Password reset code sent to your email'
  });
}));

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', validatePasswordReset, asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Find valid OTP
  const otpRecord = await OTP.findValidOTP(email, otp, 'password_reset');
  if (!otpRecord) {
    // Increment attempts
    await OTP.incrementAttempts(email, 'password_reset');
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
  }

  // Check attempts
  if (otpRecord.attempts >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
    });
  }

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Mark OTP as used
  await OTP.markAsUsed(email, otp, 'password_reset');

  // Update password
  user.password = newPassword;
  await user.save();

  // Send password reset confirmation email
  try {
    await emailService.sendPasswordResetConfirmation(email, user.firstName);
  } catch (error) {
    console.error('Failed to send password reset confirmation:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
}));

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.getPublicProfile()
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, dateOfBirth } = req.body;

  const user = await User.findById(req.user._id);
  
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.getPublicProfile()
  });
}));

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, validatePasswordChange, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', protect, asyncHandler(async (req, res) => {
  // Soft delete - deactivate account
  const user = await User.findById(req.user._id);
  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

module.exports = router; 