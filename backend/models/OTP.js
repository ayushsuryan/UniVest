const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be 6 digits']
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset', 'login_verification'],
    required: [true, 'OTP type is required']
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Maximum OTP attempts exceeded']
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index for automatic deletion
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
otpSchema.index({ email: 1, type: 1, isUsed: 1 });

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function(email, otp, type) {
  return this.findOne({
    email: email.toLowerCase(),
    otp: otp,
    type: type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to create new OTP
otpSchema.statics.createOTP = async function(email, type, otpValue, expirationMinutes = 10) {
  // Delete any existing unused OTPs for this email and type
  await this.deleteMany({
    email: email.toLowerCase(),
    type: type,
    isUsed: false
  });
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);
  
  return this.create({
    email: email.toLowerCase(),
    otp: otpValue,
    type: type,
    expiresAt: expiresAt
  });
};

// Static method to mark OTP as used
otpSchema.statics.markAsUsed = function(email, otp, type) {
  return this.findOneAndUpdate(
    {
      email: email.toLowerCase(),
      otp: otp,
      type: type,
      isUsed: false
    },
    {
      isUsed: true
    },
    { new: true }
  );
};

// Static method to increment attempts
otpSchema.statics.incrementAttempts = function(email, type) {
  return this.findOneAndUpdate(
    {
      email: email.toLowerCase(),
      type: type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    },
    {
      $inc: { attempts: 1 }
    },
    { new: true }
  );
};

module.exports = mongoose.model('OTP', otpSchema); 