const express = require('express');
const router = express.Router();
const { getBuildAdvice } = require('./advisorController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/', protect, getBuildAdvice);

module.exports = router;