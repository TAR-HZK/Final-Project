const express = require("express");
const router = express.Router();

const Item = require("../models/Item");

const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getCategories,
} = require("../controllers/itemController");

// Middleware
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/items
// Supports: ?search=, ?type=, ?category=, ?page=, ?limit=, ?available=
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    // If controller exists, use it
    if (getItems) return getItems(req, res, next);

    const {
      search,
      type,
      category,
      available,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (type && type !== "all") filter.type = type;
    if (category && category !== "all") filter.category = category;

    if (available === "true") filter.isAvailable = true;
    if (available === "false") filter.isAvailable = false;

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Item.countDocuments(filter);

    const items = await Item.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      items,
    });
  })
);

// GET /api/items/categories
router.get(
  "/categories",
  asyncHandler(async (req, res, next) => {
    if (getCategories) return getCategories(req, res, next);

    const categories = await Item.distinct("category");

    res.json({
      success: true,
      categories,
    });
  })
);

// GET /api/items/:id
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    // Use controller if available
    if (getItemById) return getItemById(req, res, next);

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    res.json({
      success: true,
      item,
    });
  })
);

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// POST /api/items
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  asyncHandler(async (req, res, next) => {
    // Use controller if available
    if (createItem) return createItem(req, res, next);

    const {
      name,
      type,
      category,
      description,
      imageUrl,
      baseAttack,
      weight,
      durability,
      requiredStats,
      scaling,
      isAvailable,
    } = req.body;

    if (!name || !type || !category) {
      return res.status(400).json({
        success: false,
        message: "name, type, and category are required.",
      });
    }

    const item = await Item.create({
      name,
      type,
      category,
      description,
      imageUrl,
      baseAttack,
      weight,
      durability,
      requiredStats,
      scaling,
      isAvailable,
      source: "manual",
    });

    res.status(201).json({
      success: true,
      message: "Item created.",
      item,
    });
  })
);

// PUT /api/items/:id
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  asyncHandler(async (req, res, next) => {
    // Use controller if available
    if (updateItem) return updateItem(req, res, next);

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    const fields = [
      "name",
      "type",
      "category",
      "description",
      "imageUrl",
      "baseAttack",
      "weight",
      "durability",
      "requiredStats",
      "scaling",
      "isAvailable",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    res.json({
      success: true,
      message: "Item updated.",
      item,
    });
  })
);

// DELETE /api/items/:id
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  asyncHandler(async (req, res, next) => {
    // Use controller if available
    if (deleteItem) return deleteItem(req, res, next);

    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    res.json({
      success: true,
      message: `Item "${item.name}" deleted.`,
    });
  })
);

// PATCH /api/items/:id/toggle
// Quick availability toggle — Admin only
router.patch(
  "/:id/toggle",
  authMiddleware,
  roleMiddleware("admin"),
  asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    item.isAvailable = !item.isAvailable;

    await item.save();

    res.json({
      success: true,
      message: `Item is now ${
        item.isAvailable ? "available" : "unavailable"
      }.`,
      item,
    });
  })
);

module.exports = router;