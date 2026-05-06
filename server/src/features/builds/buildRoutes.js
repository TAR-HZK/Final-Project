const express = require('express');
const router = express.Router();
const { 
  createBuild, 
  getBuilds, 
  getCommunityBuilds, // Import it here
  getBuildById, 
  updateBuild, 
  deleteBuild 
} = require('./buildController');
const { protect } = require('../../middleware/authMiddleware');

// 1. MUST GO FIRST: The Community Route
router.get('/community', protect, getCommunityBuilds);

// 2. Base Routes (Dashboard Ledger & Create)
router.route('/')
  .get(protect, getBuilds)
  .post(protect, createBuild);

// 3. MUST GO LAST: Dynamic ID Routes
router.route('/:id')
  .get(getBuildById)            
  .put(protect, updateBuild)    
  .delete(protect, deleteBuild);

module.exports = router;