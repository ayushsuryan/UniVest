const Investment = require('../models/Investment');
const Asset = require('../models/Asset');
const User = require('../models/User');

/**
 * Calculate and add hourly returns to all active investments
 * This job runs every hour and updates the currentValue and totalReturns
 * but does NOT add returns to user balance directly
 */
const calculateHourlyReturns = async () => {
  try {
    console.log('🔄 Starting hourly returns calculation...');
    
    // Get all active investments with their assets
    const activeInvestments = await Investment.find({ status: 'active' })
      .populate('asset', 'hourlyReturnPercentage name')
      .populate('user', 'firstName lastName email');

    if (activeInvestments.length === 0) {
      console.log('ℹ️ No active investments found');
      return;
    }

    console.log(`📊 Processing ${activeInvestments.length} active investments...`);

    let totalProcessed = 0;
    let totalReturnsAdded = 0;

    // Process each investment
    for (const investment of activeInvestments) {
      try {
        // Check if investment has matured
        const daysLeft = investment.getDaysLeft();
        
        if (daysLeft <= 0) {
          // Investment has matured, update status but don't add returns
          investment.status = 'matured';
          await investment.save();
          console.log(`✅ Investment ${investment._id} marked as matured`);
          continue;
        }

        // Calculate per-minute return (hourly return divided by 60)
        const hourlyReturnPercentage = investment.asset.hourlyReturnPercentage;
        const perMinuteReturnPercentage = hourlyReturnPercentage / 60; // Divide by 60 for per-minute calculation
        const returnAmount = (investment.investedAmount * perMinuteReturnPercentage) / 100;
        
        // Add per-minute return to investment (this updates currentValue and totalReturns)
        await investment.addHourlyReturn(returnAmount, perMinuteReturnPercentage);
        
        totalProcessed++;
        totalReturnsAdded += returnAmount;
        
        console.log(`💰 Added ₹${returnAmount.toFixed(4)} per-minute return to ${investment.asset.name} investment for ${investment.user.firstName}`);
        
      } catch (error) {
        console.error(`❌ Error processing investment ${investment._id}:`, error.message);
      }
    }

    console.log(`✅ Per-minute returns calculation completed:`);
    console.log(`   - Processed: ${totalProcessed} investments`);
    console.log(`   - Total returns added: ₹${totalReturnsAdded.toFixed(4)}`);
    console.log(`   - Timestamp: ${new Date().toISOString()}`);

    // Update asset return history with per-minute data
    await updateAssetReturnHistory();

  } catch (error) {
    console.error('❌ Error in per-minute returns calculation:', error);
  }
};

/**
 * Update per-minute return history for all assets
 */
const updateAssetReturnHistory = async () => {
  try {
    const assets = await Asset.find({ isActive: true });
    
    for (const asset of assets) {
      // Get total active investments for this asset
      const totalInvestments = await Investment.countDocuments({
        asset: asset._id,
        status: 'active'
      });
      
      // Add per-minute return history entry (hourly percentage divided by 60)
      const perMinuteReturnPercentage = asset.hourlyReturnPercentage / 60;
      await asset.addHourlyReturn(perMinuteReturnPercentage, totalInvestments);
    }
    
    console.log('📈 Asset per-minute return history updated');
  } catch (error) {
    console.error('❌ Error updating asset return history:', error);
  }
};

/**
 * Get summary of hourly returns job
 */
const getHourlyReturnsSummary = async () => {
  try {
    const activeInvestments = await Investment.countDocuments({ status: 'active' });
    const maturedInvestments = await Investment.countDocuments({ status: 'matured' });
    const totalInvestments = await Investment.countDocuments();
    
    const totalInvestedAmount = await Investment.aggregate([
      { $match: { status: { $in: ['active', 'matured'] } } },
      { $group: { _id: null, total: { $sum: '$investedAmount' } } }
    ]);
    
    const totalCurrentValue = await Investment.aggregate([
      { $match: { status: { $in: ['active', 'matured'] } } },
      { $group: { _id: null, total: { $sum: '$currentValue' } } }
    ]);
    
    return {
      activeInvestments,
      maturedInvestments,
      totalInvestments,
      totalInvestedAmount: totalInvestedAmount[0]?.total || 0,
      totalCurrentValue: totalCurrentValue[0]?.total || 0,
      totalReturns: (totalCurrentValue[0]?.total || 0) - (totalInvestedAmount[0]?.total || 0),
      lastRun: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting hourly returns summary:', error);
    return null;
  }
};

module.exports = {
  calculateHourlyReturns,
  updateAssetReturnHistory,
  getHourlyReturnsSummary
}; 