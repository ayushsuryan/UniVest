const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all active assets
router.get('/', async (req, res) => {
  try {
    const { category, demand } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (demand && demand !== 'all') {
      if (demand === 'high') {
        query.currentDemand = { $in: ['High', 'Very High'] };
      } else if (demand === 'medium') {
        query.currentDemand = 'Medium';
      } else if (demand === 'low') {
        query.currentDemand = 'Low';
      }
    }
    
    const assets = await Asset.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: assets,
      count: assets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
});

// Get single asset by ID
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');
    
    if (!asset || !asset.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching asset',
      error: error.message
    });
  }
});

// Create new asset (Admin only - for now, we'll create without auth)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      price,
      maturityPeriod,
      hourlyReturnPercentage,
      image,
      hourlyReturnReferralPercentage,
      category,
      minInvestment,
      currentDemand,
      createdBy
    } = req.body;
    
    // For now, we'll use a default admin user ID or create assets without specific user
    // In production, you should implement proper admin authentication
    let adminUser = await User.findOne({ email: 'admin@finance.com' });
    if (!adminUser) {
      // Create a default admin user for asset creation
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@finance.com',
        password: 'admin123', // This will be hashed by the pre-save hook
        isEmailVerified: true
      });
      await adminUser.save();
    }
    
    const asset = new Asset({
      name,
      price,
      maturityPeriod,
      hourlyReturnPercentage,
      image,
      hourlyReturnReferralPercentage,
      category,
      minInvestment,
      currentDemand: currentDemand || 'Medium',
      createdBy: createdBy || adminUser._id
    });
    
    await asset.save();
    await asset.populate('createdBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: asset
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating asset',
      error: error.message
    });
  }
});

// Update asset (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    const allowedUpdates = [
      'name', 'price', 'maturityPeriod', 'hourlyReturnPercentage',
      'image', 'hourlyReturnReferralPercentage', 'category',
      'minInvestment', 'currentDemand', 'isActive'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        asset[field] = req.body[field];
      }
    });
    
    await asset.save();
    await asset.populate('createdBy', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: asset
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating asset',
      error: error.message
    });
  }
});

// Delete asset (Admin only - soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    asset.isActive = false;
    await asset.save();
    
    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message
    });
  }
});

// Seed test assets
router.post('/seed/test-data', async (req, res) => {
  try {
    // Clear existing assets first (optional - for testing)
    if (req.body.clearExisting || req.query.clear) {
      await Asset.deleteMany({});
      console.log('Cleared existing assets');
    }
    
    // Check if assets already exist (unless clearing)
    const existingAssets = await Asset.countDocuments();
    if (existingAssets > 0 && !req.body.clearExisting && !req.query.clear) {
      return res.json({
        success: true,
        message: 'Test data already exists',
        count: existingAssets
      });
    }
    
    // Create or get admin user
    let adminUser = await User.findOne({ email: 'admin@finance.com' });
    if (!adminUser) {
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@finance.com',
        password: 'admin123',
        isEmailVerified: true
      });
      await adminUser.save();
    }
    
    const testAssets = [
      {
        name: 'Phone Chargers',
        price: 15,
        category: 'Electronics',
        hourlyReturnPercentage: 0.8,
        hourlyReturnReferralPercentage: 0.2,
        minInvestment: 500,
        currentDemand: 'High',
        maturityPeriod: '30 days',
        totalInvestors: 1245,
        image: 'https://picsum.photos/200/200?random=1',
        createdBy: adminUser._id
      },
      {
        name: 'Bluetooth Earbuds',
        price: 45,
        category: 'Electronics',
        hourlyReturnPercentage: 1.2,
        hourlyReturnReferralPercentage: 0.3,
        minInvestment: 1000,
        currentDemand: 'Very High',
        maturityPeriod: '45 days',
        totalInvestors: 892,
        image: 'https://picsum.photos/200/200?random=2',
        createdBy: adminUser._id
      },
      {
        name: 'LED Monitors',
        price: 150,
        category: 'Electronics',
        hourlyReturnPercentage: 0.6,
        hourlyReturnReferralPercentage: 0.15,
        minInvestment: 2000,
        currentDemand: 'Medium',
        maturityPeriod: '60 days',
        totalInvestors: 567,
        image: 'https://picsum.photos/200/200?random=3',
        createdBy: adminUser._id
      },
      {
        name: 'Gaming Laptops',
        price: 800,
        category: 'Electronics',
        hourlyReturnPercentage: 1.5,
        hourlyReturnReferralPercentage: 0.4,
        minInvestment: 5000,
        currentDemand: 'High',
        maturityPeriod: '90 days',
        totalInvestors: 234,
        image: 'https://picsum.photos/200/200?random=4',
        createdBy: adminUser._id
      },
      {
        name: 'Smart Watches',
        price: 200,
        category: 'Wearables',
        hourlyReturnPercentage: 0.9,
        hourlyReturnReferralPercentage: 0.25,
        minInvestment: 1500,
        currentDemand: 'High',
        maturityPeriod: '45 days',
        totalInvestors: 678,
        image: 'https://picsum.photos/200/200?random=5',
        createdBy: adminUser._id
      },
      {
        name: 'Wireless Mice',
        price: 25,
        category: 'Accessories',
        hourlyReturnPercentage: 0.4,
        hourlyReturnReferralPercentage: 0.1,
        minInvestment: 300,
        currentDemand: 'Medium',
        maturityPeriod: '30 days',
        totalInvestors: 456,
        image: 'https://picsum.photos/200/200?random=6',
        createdBy: adminUser._id
      }
    ];
    
    const createdAssets = await Asset.insertMany(testAssets);
    
    res.status(201).json({
      success: true,
      message: 'Test assets created successfully',
      data: createdAssets,
      count: createdAssets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error seeding test data',
      error: error.message
    });
  }
});

// Get asset categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Asset.distinct('category', { isActive: true });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

module.exports = router; 