# Finance App Backend

A secure and scalable Node.js backend for the Finance React Native application with authentication, OTP verification, and email services.

## Features

- 🔐 **User Authentication** - JWT-based authentication with secure password hashing
- 📧 **Email Verification** - OTP-based email verification using Gmail SMTP
- 🔄 **Password Reset** - Secure password reset with OTP verification
- 🛡️ **Security** - Rate limiting, input validation, and security headers
- 📱 **Mobile Ready** - Designed for React Native mobile applications
- 🗄️ **MongoDB** - Robust data storage with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer with Gmail
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Gmail account with App Password

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd Finance/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance_app
   
   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (Gmail)
   EMAIL_USER=your_gmail_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # OTP Configuration
   OTP_EXPIRES_IN=10
   OTP_LENGTH=6
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Gmail Setup

To use Gmail for sending emails:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS` environment variable

## API Endpoints

### Authentication Routes

All routes are prefixed with `/api/auth`

#### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/verify-email` | Verify email with OTP |
| POST | `/resend-verification-otp` | Resend verification OTP |
| POST | `/login` | User login |
| POST | `/forgot-password` | Send password reset OTP |
| POST | `/reset-password` | Reset password with OTP |

#### Protected Routes (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update user profile |
| PUT | `/change-password` | Change password |
| POST | `/logout` | Logout user |
| DELETE | `/account` | Deactivate account |

### API Examples

#### 1. Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890"
}
```

#### 2. Verify Email
```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

#### 3. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

#### 4. Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

#### 5. Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123"
}
```

#### 6. Get Profile (Protected)
```bash
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Optional data
  "errors": [] // Optional validation errors
}
```

### Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Validates all user inputs
- **Password Hashing**: Uses bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation
- **CORS Protection**: Configurable cross-origin requests
- **Security Headers**: Helmet.js for security headers
- **OTP Security**: Time-limited OTPs with attempt limits

## Database Schema

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (optional),
  isEmailVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  profilePicture: String (optional),
  dateOfBirth: Date (optional),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model
```javascript
{
  email: String (required),
  otp: String (required),
  type: String (enum: ['email_verification', 'password_reset', 'login_verification']),
  isUsed: Boolean (default: false),
  attempts: Number (default: 0, max: 5),
  expiresAt: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: 400 status with detailed field errors
- **Authentication Errors**: 401 status for invalid credentials
- **Authorization Errors**: 403 status for insufficient permissions
- **Not Found Errors**: 404 status for missing resources
- **Rate Limit Errors**: 429 status for too many requests
- **Server Errors**: 500 status for internal server errors

## Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (placeholder)
```

### Project Structure

```
backend/
├── models/           # Mongoose models
│   ├── User.js
│   └── OTP.js
├── routes/           # Express routes
│   └── auth.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── services/         # Business logic services
│   └── emailService.js
├── utils/            # Utility functions
│   ├── otpGenerator.js
│   └── validators.js
├── .env              # Environment variables
├── .env.example      # Environment template
├── server.js         # Main server file
└── package.json      # Dependencies and scripts
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance_app
JWT_SECRET=your_production_jwt_secret
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_production_app_password
FRONTEND_URL=https://your-frontend-domain.com
```

### Production Considerations

1. **Use strong JWT secrets** in production
2. **Enable HTTPS** for secure token transmission
3. **Configure proper CORS** origins
4. **Set up monitoring** and logging
5. **Use environment-specific** MongoDB clusters
6. **Implement backup** strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository. 