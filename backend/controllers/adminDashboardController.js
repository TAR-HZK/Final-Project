const User = require("../models/User");
const Build = require("../models/Build");
const Comment = require("../models/Comment");
const Rating = require("../models/Rating");
const Item = require("../models/Item"); // From Huzaifa's Item Database module

/**
 * GET /api/admin/dashboard
 * Aggregates all site-wide stats for the Admin Dashboard.
 * Admin only.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOf30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const startOf7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // ── Run all aggregations in parallel for performance ──────────────────────
    const [
      totalUsers,
      newUsersToday,
      newUsers7d,
      newUsers30d,
      totalBuilds,
      publicBuilds,
      newBuilds7d,
      totalComments,
      flaggedComments,
      totalRatings,
      totalItems,
      userGrowthData,
      buildGrowthData,
      topRatedBuilds,
      mostCommentedBuilds,
      recentActivity,
      buildVisibility,
      avgRatingOverall,
    ] = await Promise.all([

      // ── Users ───────────────────────────────────────────────────────────────
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOf7Days } }),
      User.countDocuments({ createdAt: { $gte: startOf30Days } }),

      // ── Builds ──────────────────────────────────────────────────────────────
      Build.countDocuments(),
      Build.countDocuments({ isPublic: true }),
      Build.countDocuments({ createdAt: { $gte: startOf7Days } }),

      // ── Comments ────────────────────────────────────────────────────────────
      Comment.countDocuments(),
      Comment.countDocuments({ isFlagged: true }),

      // ── Ratings ─────────────────────────────────────────────────────────────
      Rating.countDocuments(),

      // ── Items ───────────────────────────────────────────────────────────────
      Item.countDocuments(),

      // ── User growth: registrations per day for last 30 days ─────────────────
      User.aggregate([
        { $match: { createdAt: { $gte: startOf30Days } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // ── Build creation: builds per day for last 30 days ──────────────────────
      Build.aggregate([
        { $match: { createdAt: { $gte: startOf30Days } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // ── Top 5 rated builds ────────────────────────────────────────────────────
      Rating.aggregate([
        {
          $group: {
            _id: "$buildId",
            avgRating: { $avg: "$value" },
            ratingCount: { $sum: 1 },
          },
        },
        { $sort: { avgRating: -1, ratingCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "builds",
            localField: "_id",
            foreignField: "_id",
            as: "build",
          },
        },
        { $unwind: "$build" },
        {
          $project: {
            title: "$build.title",
            isPublic: "$build.isPublic",
            avgRating: { $round: ["$avgRating", 1] },
            ratingCount: 1,
          },
        },
      ]),

      // ── Top 5 most commented builds ──────────────────────────────────────────
      Comment.aggregate([
        { $match: { isFlagged: false } },
        { $group: { _id: "$buildId", commentCount: { $sum: 1 } } },
        { $sort: { commentCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "builds",
            localField: "_id",
            foreignField: "_id",
            as: "build",
          },
        },
        { $unwind: "$build" },
        { $project: { title: "$build.title", commentCount: 1 } },
      ]),

      // ── Recent activity: last 10 registrations + builds combined ─────────────
      User.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            type: { $literal: "user_joined" },
            label: "$name",
            timestamp: "$createdAt",
          },
        },
      ]),

      // ── Build visibility breakdown ────────────────────────────────────────────
      Build.aggregate([
        {
          $group: {
            _id: "$isPublic",
            count: { $sum: 1 },
          },
        },
      ]),

      // ── Overall average rating across all rated builds ────────────────────────
      Rating.aggregate([
        { $group: { _id: null, avg: { $avg: "$value" }, total: { $sum: 1 } } },
      ]),
    ]);

    // ── Recent builds for activity feed ────────────────────────────────────────
    const recentBuilds = await Build.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("authorId", "name")
      .select("title createdAt authorId isPublic");

    // ── Combine + format recent activity ───────────────────────────────────────
    const activityFeed = [
      ...recentActivity.map((u) => ({
        type: "user_joined",
        label: u.label,
        timestamp: u.timestamp,
      })),
      ...recentBuilds.map((b) => ({
        type: "build_created",
        label: b.title,
        author: b.authorId?.name,
        isPublic: b.isPublic,
        timestamp: b.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // ── Build visibility map ───────────────────────────────────────────────────
    const visibilityMap = { public: 0, private: 0 };
    buildVisibility.forEach((v) => {
      if (v._id === true) visibilityMap.public = v.count;
      else visibilityMap.private = v.count;
    });

    res.json({
      success: true,
      data: {
        // Totals
        totals: {
          users: totalUsers,
          builds: totalBuilds,
          publicBuilds,
          privateBuilds: visibilityMap.private,
          comments: totalComments,
          flaggedComments,
          ratings: totalRatings,
          items: totalItems,
        },
        // Growth snapshots
        growth: {
          newUsersToday,
          newUsers7d,
          newUsers30d,
          newBuilds7d,
        },
        // Average rating
        avgRating: avgRatingOverall[0]?.avg
          ? parseFloat(avgRatingOverall[0].avg.toFixed(2))
          : null,

        // Chart data (last 30 days)
        charts: {
          userGrowth: userGrowthData,   // [{ _id: "2025-05-01", count: 3 }, ...]
          buildGrowth: buildGrowthData,
        },

        // Leaderboards
        topRatedBuilds,
        mostCommentedBuilds,

        // Activity feed
        recentActivity: activityFeed,
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
