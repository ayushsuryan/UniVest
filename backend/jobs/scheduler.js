const cron = require('node-cron');
const { calculateHourlyReturns, getHourlyReturnsSummary } = require('./hourlyReturns');

/**
 * Initialize and start all cron jobs
 */
const initializeScheduler = () => {
  console.log('🚀 Initializing job scheduler...');

  // Run hourly returns calculation every hour
  // Cron expression: '0 * * * *' means "at minute 0 of every hour"
  const hourlyReturnsJob = cron.schedule('0 * * * *', async () => {
    console.log('⏰ Hourly returns cron job triggered');
    await calculateHourlyReturns();
  }, {
    scheduled: false,
    timezone: "Asia/Kolkata" // Indian timezone
  });

  // Start the job
  hourlyReturnsJob.start();
  console.log('✅ Hourly returns job scheduled (runs every hour at minute 0)');

  // Optional: Run a summary job every 6 hours for monitoring
  const summaryJob = cron.schedule('0 */6 * * *', async () => {
    console.log('📊 Generating hourly returns summary...');
    const summary = await getHourlyReturnsSummary();
    if (summary) {
      console.log('📈 Hourly Returns Summary:', summary);
    }
  }, {
    scheduled: false,
    timezone: "Asia/Kolkata"
  });

  summaryJob.start();
  console.log('✅ Summary job scheduled (runs every 6 hours)');

  // For testing: Optional immediate run (uncomment for testing)
  console.log('🧪 Running initial hourly returns calculation for testing...');
  setTimeout(() => calculateHourlyReturns(), 5000); // Run after 5 seconds

  return {
    hourlyReturnsJob,
    summaryJob
  };
};

/**
 * Stop all scheduled jobs
 */
const stopScheduler = (jobs) => {
  if (jobs) {
    Object.values(jobs).forEach(job => {
      if (job && typeof job.stop === 'function') {
        job.stop();
      }
    });
    console.log('🛑 All scheduled jobs stopped');
  }
};

/**
 * Get status of all scheduled jobs
 */
const getSchedulerStatus = (jobs) => {
  if (!jobs) return { status: 'not_initialized' };

  return {
    status: 'running',
    jobs: {
      hourlyReturns: jobs.hourlyReturnsJob ? 'active' : 'inactive',
      summary: jobs.summaryJob ? 'active' : 'inactive'
    },
    timezone: 'Asia/Kolkata',
    nextHourlyRun: getNextCronRun('0 * * * *'),
    nextSummaryRun: getNextCronRun('0 */6 * * *')
  };
};

/**
 * Calculate next cron run time
 */
const getNextCronRun = (cronExpression) => {
  try {
    const task = cron.schedule(cronExpression, () => {}, { scheduled: false });
    return task.getStatus();
  } catch (error) {
    return 'unknown';
  }
};

module.exports = {
  initializeScheduler,
  stopScheduler,
  getSchedulerStatus
}; 