const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Use direct SMTP configuration instead of service
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports like 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Reduced timeouts to prevent hanging
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,    // 5 seconds  
      socketTimeout: 10000,     // 10 seconds
      tls: {
        rejectUnauthorized: false
      }
    });

    // Alternative configuration for fallback
    this.fallbackTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Verify email configuration
  async verifyConnection() {
    try {
      await Promise.race([
        this.transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection verification timeout')), 8000)
        )
      ]);
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error.message);
      return false;
    }
  }

  // Try sending with fallback and timeout
  async sendEmailWithFallback(mailOptions) {
    try {
      // Try primary transporter first with timeout
      const info = await Promise.race([
        this.transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Primary email timeout')), 12000)
        )
      ]);
      console.log('✅ Email sent via primary transporter:', info.messageId);
      return { success: true, messageId: info.messageId, method: 'primary' };
    } catch (primaryError) {
      console.log('⚠️ Primary email failed, trying fallback:', primaryError.message);
      
      try {
        // Try fallback transporter with timeout
        const info = await Promise.race([
          this.fallbackTransporter.sendMail(mailOptions),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Fallback email timeout')), 12000)
          )
        ]);
        console.log('✅ Email sent via fallback transporter:', info.messageId);
        return { success: true, messageId: info.messageId, method: 'fallback' };
      } catch (fallbackError) {
        console.error('❌ Both email methods failed');
        console.error('Primary error:', primaryError.message);
        console.error('Fallback error:', fallbackError.message);
        // Don't throw error - return failure instead
        return { success: false, error: fallbackError.message };
      }
    }
  }

  // Send OTP email with better error handling
  async sendOTP(email, otp, type = 'verification') {
    const subject = this.getOTPSubject(type);
    const html = this.getOTPTemplate(otp, type);

    const mailOptions = {
      from: `"Finance App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    try {
      const result = await this.sendEmailWithFallback(mailOptions);
      if (result.success) {
        console.log(`📧 OTP email sent successfully via ${result.method}:`, result.messageId);
        return {
          success: true,
          messageId: result.messageId,
          method: result.method
        };
      } else {
        console.error('❌ Failed to send OTP email:', result.error);
        // Return false instead of throwing error
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      // Return false instead of throwing error
      return { success: false, error: error.message };
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, firstName) {
    const subject = 'Welcome to Finance App!';
    const html = this.getWelcomeTemplate(firstName);

    const mailOptions = {
      from: `"Finance App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    try {
      const info = await Promise.race([
        this.transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Welcome email timeout')), 10000)
        )
      ]);
      console.log('✅ Welcome email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      // Don't throw error for welcome email failure
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send password reset confirmation email
  async sendPasswordResetConfirmation(email, firstName) {
    const subject = 'Password Reset Successful';
    const html = this.getPasswordResetConfirmationTemplate(firstName);

    const mailOptions = {
      from: `"Finance App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset confirmation email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending password reset confirmation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get OTP subject based on type
  getOTPSubject(type) {
    switch (type) {
      case 'email_verification':
        return 'Verify Your Email - Finance App';
      case 'password_reset':
        return 'Password Reset Code - Finance App';
      case 'login_verification':
        return 'Login Verification Code - Finance App';
      default:
        return 'Verification Code - Finance App';
    }
  }

  // Get OTP email template
  getOTPTemplate(otp, type) {
    const purpose = this.getOTPPurpose(type);
    const expiryMinutes = process.env.OTP_EXPIRES_IN || 10;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏦 Finance App</h1>
                <p>Your trusted financial companion</p>
            </div>
            <div class="content">
                <h2>Verification Code</h2>
                <p>Hello! You requested ${purpose}. Please use the verification code below:</p>
                
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This code will expire in ${expiryMinutes} minutes</li>
                        <li>Never share this code with anyone</li>
                        <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                </div>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br>The Finance App Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>&copy; 2024 Finance App. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Get welcome email template
  getWelcomeTemplate(firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Finance App</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Finance App!</h1>
                <p>Your journey to financial freedom starts here</p>
            </div>
            <div class="content">
                <h2>Hello ${firstName}!</h2>
                <p>Thank you for joining Finance App! We're excited to help you take control of your finances and achieve your financial goals.</p>
                
                <h3>What you can do with Finance App:</h3>
                <div class="feature">
                    <strong>📊 Track Expenses:</strong> Monitor your spending patterns and identify areas for improvement
                </div>
                <div class="feature">
                    <strong>💰 Budget Management:</strong> Create and manage budgets that work for your lifestyle
                </div>
                <div class="feature">
                    <strong>📈 Financial Insights:</strong> Get personalized insights and recommendations
                </div>
                <div class="feature">
                    <strong>🎯 Goal Setting:</strong> Set and track your financial goals with ease
                </div>
                
                <p>Your email has been successfully verified and your account is now active. You can start exploring all the features right away!</p>
                
                <p>If you have any questions or need help getting started, our support team is here to assist you.</p>
                
                <p>Happy budgeting!<br>The Finance App Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Finance App. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Get password reset confirmation template
  getPasswordResetConfirmationTemplate(firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Finance App</h1>
                <p>Security Notification</p>
            </div>
            <div class="content">
                <h2>Password Reset Successful</h2>
                <p>Hello ${firstName},</p>
                
                <div class="success-box">
                    <strong>✅ Your password has been successfully reset!</strong>
                </div>
                
                <p>Your Finance App account password has been updated successfully. You can now log in with your new password.</p>
                
                <p><strong>If you did not make this change:</strong></p>
                <ul>
                    <li>Please contact our support team immediately</li>
                    <li>Consider enabling additional security measures</li>
                    <li>Review your account activity</li>
                </ul>
                
                <p>For your security, we recommend:</p>
                <ul>
                    <li>Using a strong, unique password</li>
                    <li>Not sharing your login credentials</li>
                    <li>Logging out from shared devices</li>
                </ul>
                
                <p>Thank you for keeping your account secure!</p>
                
                <p>Best regards,<br>The Finance App Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>&copy; 2024 Finance App. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Get OTP purpose text
  getOTPPurpose(type) {
    switch (type) {
      case 'email_verification':
        return 'to verify your email address';
      case 'password_reset':
        return 'to reset your password';
      case 'login_verification':
        return 'to verify your login';
      default:
        return 'for verification';
    }
  }
}

module.exports = new EmailService(); 