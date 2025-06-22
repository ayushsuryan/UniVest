const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import job scheduler
const { initializeScheduler } = require('./jobs/scheduler');

const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const investmentRoutes = require('./routes/investments');
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');

const app = express();

// Trust proxy for Nginx reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: '*',
    credentials: false,
  }),
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_app')
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Initialize job scheduler after database connection
    const schedulerJobs = initializeScheduler();

    // Store scheduler jobs for graceful shutdown
    app.locals.schedulerJobs = schedulerJobs;
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/investments', investmentRoutes);

// Admin setup route (for initial admin user creation)
app.post(
  '/api/admin/setup',
  asyncHandler(async (req, res) => {
    const User = require('./models/User');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: 'admin@finance.com' },
        { role: 'admin' },
        { isAdmin: true },
      ],
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists',
      });
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@finance.com',
      password: 'admin123', // This will be hashed
      isEmailVerified: true,
      role: 'admin',
      isAdmin: true,
      balance: 100000, // Give admin some balance for testing
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: adminUser.email,
        name: `${adminUser.firstName} ${adminUser.lastName}`,
        role: adminUser.role,
      },
    });
  }),
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Finance Backend Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Scheduler status endpoint
app.get('/api/scheduler/status', (req, res) => {
  const { getSchedulerStatus } = require('./jobs/scheduler');
  const status = getSchedulerStatus(app.locals.schedulerJobs);

  res.status(200).json({
    success: true,
    data: status,
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');

  // Stop scheduler jobs
  if (app.locals.schedulerJobs) {
    const { stopScheduler } = require('./jobs/scheduler');
    stopScheduler(app.locals.schedulerJobs);
  }

  server.close(async () => {
    console.log('✅ Server closed');
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');

  // Stop scheduler jobs
  if (app.locals.schedulerJobs) {
    const { stopScheduler } = require('./jobs/scheduler');
    stopScheduler(app.locals.schedulerJobs);
  }

  server.close(async () => {
    console.log('✅ Server closed');
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });
});

module.exports = app;

//test
