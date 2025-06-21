const crypto = require('crypto');

class OTPGenerator {
  // Generate a random OTP of specified length
  static generate(length = 6) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  // Generate a cryptographically secure OTP
  static generateSecure(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    
    // Generate random bytes
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    
    // Scale to desired range
    const otp = min + (randomNumber % (max - min + 1));
    
    return otp.toString().padStart(length, '0');
  }

  // Validate OTP format
  static validate(otp, length = 6) {
    if (!otp || typeof otp !== 'string') {
      return {
        isValid: false,
        error: 'OTP must be a string'
      };
    }

    if (otp.length !== length) {
      return {
        isValid: false,
        error: `OTP must be ${length} digits long`
      };
    }

    if (!/^\d+$/.test(otp)) {
      return {
        isValid: false,
        error: 'OTP must contain only digits'
      };
    }

    return {
      isValid: true,
      error: null
    };
  }

  // Generate OTP with expiration time
  static generateWithExpiry(length = 6, expiryMinutes = 10) {
    const otp = this.generateSecure(length);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    return {
      otp,
      expiresAt
    };
  }

  // Check if OTP is expired
  static isExpired(expiresAt) {
    return new Date() > new Date(expiresAt);
  }
}

module.exports = OTPGenerator; 