const Build = require("../models/Build");
const Comment = require("../models/Comment");
const Rating = require("../models/Rating");

// ─── PUBLIC BUILDS FEED ────────────────────────────────────────────────────────

/**
 * GET /api/community/builds
 * Fetch paginated public builds feed with avg rating & comment count.
 * Query params: page, limit, sort (newest|top), search
 */
exports.getPublicBuilds = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const sort = req.query.sort === "top" ? { avgRating: -1 } : { createdAt: -1 };
    const search = req.query.search?.trim();

    const matchStage = { isPublic: true };
    if (search) {
      matchStage.title = { $regex: search, $options: "i" };
    }

    const builds = await Build.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "buildId",
          as: "ratings",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "buildId",
          as: "comments",
        },
      },
      {
        $addFields: {
          avgRating: { $avg: "$ratings.value" },
          ratingCount: { $size: "$ratings" },
          commentCount: { $size: "$comments" },
        },
      },
      { $project: { ratings: 0, comments: 0 } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $addFields: {
          author: { $arrayElemAt: ["$author", 0] },
        },
      },
      {
        $project: {
          "author.password": 0,
          "author.role": 0,
        },
      },
    ]);

    const total = await Build.countDocuments(matchStage);

    res.json({
      success: true,
      data: builds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/community/builds/:id
 * Fetch a single public build with full details.
 */
exports.getBuildById = async (req, res) => {
  try {
    const build = await Build.findOne({
      _id: req.params.id,
      isPublic: true,
    }).populate("authorId", "name email");

    if (!build) {
      return res.status(404).json({ success: false, message: "Build not found" });
    }

    const [ratingData] = await Rating.aggregate([
      { $match: { buildId: build._id } },
      {
        $group: {
          _id: null,
          avg: { $avg: "$value" },
          count: { $sum: 1 },
        },
      },
    ]);

    // If requester is logged in, fetch their rating
    let userRating = null;
    if (req.user) {
      const existing = await Rating.findOne({ buildId: build._id, userId: req.user._id });
      if (existing) userRating = existing.value;
    }

    res.json({
      success: true,
      data: {
        ...build.toObject(),
        avgRating: ratingData?.avg || 0,
        ratingCount: ratingData?.count || 0,
        userRating,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RATINGS ──────────────────────────────────────────────────────────────────

/**
 * POST /api/community/builds/:id/rate
 * Rate a build (1-5). Upserts — a user can change their rating.
 */
exports.rateBuild = async (req, res) => {
  try {
    const { value } = req.body;

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const build = await Build.findOne({ _id: req.params.id, isPublic: true });
    if (!build) {
      return res.status(404).json({ success: false, message: "Build not found" });
    }

    // Prevent author from rating their own build
    if (build.authorId.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You cannot rate your own build" });
    }

    await Rating.findOneAndUpdate(
      { buildId: build._id, userId: req.user._id },
      { value },
      { upsert: true, new: true }
    );

    const [ratingData] = await Rating.aggregate([
      { $match: { buildId: build._id } },
      { $group: { _id: null, avg: { $avg: "$value" }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      message: "Rating submitted",
      data: {
        avgRating: ratingData?.avg || 0,
        ratingCount: ratingData?.count || 0,
        userRating: value,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

/**
 * GET /api/community/builds/:id/comments
 * Fetch paginated comments for a build.
 */
exports.getComments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      buildId: req.params.id,
      isFlagged: false,
    })
      .populate("authorId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      buildId: req.params.id,
      isFlagged: false,
    });

    res.json({
      success: true,
      data: comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/community/builds/:id/comments
 * Add a comment to a build.
 */
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const build = await Build.findOne({ _id: req.params.id, isPublic: true });
    if (!build) {
      return res.status(404).json({ success: false, message: "Build not found" });
    }

    const comment = await Comment.create({
      buildId: build._id,
      authorId: req.user._id,
      content: content.trim(),
    });

    await comment.populate("authorId", "name");

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/community/comments/:commentId
 * Delete own comment (user) or any comment (admin).
 */
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const isOwner = comment.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await comment.deleteOne();

    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/community/comments/:commentId/flag
 * Flag a comment as inappropriate (any logged-in user).
 */
exports.flagComment = async (req, res) => {
  try {
    const { reason } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { isFlagged: true, flagReason: reason || "Inappropriate content" },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    res.json({ success: true, message: "Comment flagged for moderation" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * GET /api/community/admin/flagged
 * Get all flagged comments (admin only).
 */
exports.getFlaggedComments = async (req, res) => {
  try {
    const comments = await Comment.find({ isFlagged: true })
      .populate("authorId", "name email")
      .populate("buildId", "title")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/community/admin/comments/:commentId/unflag
 * Clear a flag (admin only) — approve the comment.
 */
exports.unflagComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { isFlagged: false, flagReason: null },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    res.json({ success: true, message: "Comment approved", data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
