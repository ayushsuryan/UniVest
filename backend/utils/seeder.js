const mongoose = require('mongoose');
const Asset = require('../models/Asset'); // Adjust the path as needed

// Connect to your MongoDB
const MONGODB_URI = 'mongodb+srv://ayush:mypassword@cluster0.6rwkptj.mongodb.net/finance_app'; // Replace with your DB URI

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  seedAssets();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

async function seedAssets() {
  try {
    // Clear existing assets
    await Asset.deleteMany({});
    
    // Dummy user ID – replace with actual user ID from your DB
    const dummyUserId = new mongoose.Types.ObjectId();

    const assets = [
      {
        name: 'Cucumber',
        price: 100,
        maturityPeriod: '30 days',
        hourlyReturnPercentage: 0.5,
        image: 'https://example.com/images/cucumber.png',
        hourlyReturnReferralPercentage: 0.1,
        category: 'Vegetable',
        minInvestment: 50,
        currentDemand: 'Medium',
        totalInvestors: 0,
        totalInvestmentAmount: 0,
        createdBy: dummyUserId
      },
      {
        name: 'Safron',
        price: 5000,
        maturityPeriod: '90 days',
        hourlyReturnPercentage: 1.2,
        image: 'https://example.com/images/safron.png',
        hourlyReturnReferralPercentage: 0.5,
        category: 'Spice',
        minInvestment: 1000,
        currentDemand: 'High',
        totalInvestors: 0,
        totalInvestmentAmount: 0,
        createdBy: dummyUserId
      },
      {
        name: 'Rajnigandha',
        price: 200,
        maturityPeriod: '45 days',
        hourlyReturnPercentage: 0.7,
        image: 'https://example.com/images/rajnigandha.png',
        hourlyReturnReferralPercentage: 0.2,
        category: 'Flower',
        minInvestment: 100,
        currentDemand: 'Low',
        totalInvestors: 0,
        totalInvestmentAmount: 0,
        createdBy: dummyUserId
      }
    ];

    const inserted = await Asset.insertMany(assets);
    console.log(`Seeded ${inserted.length} assets`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding assets:', error);
    process.exit(1);
  }
}
