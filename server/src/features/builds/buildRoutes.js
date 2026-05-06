const express = require('express');
const router = express.Router();
const { 
  createBuild, 
  getBuilds, 
  getBuildById, 
  updateBuild, 
  deleteBuild 
} = require('./buildController');
const { protect } = require('../../middleware/authMiddleware');

// Routes for /api/builds/
router.route('/')
  .get(getBuilds)
  .post(protect, createBuild);

// Routes for /api/builds/:id
router.route('/:id')
  .get(getBuildById)            // Anyone can view a specific build
  .put(protect, updateBuild)    // Only the author can edit it
  .delete(protect, deleteBuild);// Only the author can delete it

module.exports = router;