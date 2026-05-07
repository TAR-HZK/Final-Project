const express = require("express");
const router = express.Router();
const {
  getPublicBuilds,
  getBuildById,
  rateBuild,
  getComments,
  addComment,
  deleteComment,
  flagComment,
  getFlaggedComments,
  unflagComment,
} = require("../controllers/communityController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

// ─── Public Feed ──────────────────────────────────────────────────────────────
router.get("/builds", getPublicBuilds);
router.get("/builds/:id", getBuildById);
router.get("/builds/:id/comments", getComments);

// ─── Authenticated ────────────────────────────────────────────────────────────
router.post("/builds/:id/rate", authMiddleware, rateBuild);
router.post("/builds/:id/comments", authMiddleware, addComment);
router.delete("/comments/:commentId", authMiddleware, deleteComment);
router.patch("/comments/:commentId/flag", authMiddleware, flagComment);

// ─── Admin Only ───────────────────────────────────────────────────────────────
router.get("/admin/flagged", authMiddleware, roleMiddleware("admin"), getFlaggedComments);
router.patch(
  "/admin/comments/:commentId/unflag",
  authMiddleware,
  roleMiddleware("admin"),
  unflagComment
);

module.exports = router;
