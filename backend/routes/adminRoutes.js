const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/adminDashboardController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

// GET /api/admin/dashboard
router.get("/dashboard", authMiddleware, roleMiddleware("admin"), getDashboardStats);

module.exports = router;
