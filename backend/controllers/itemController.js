const Item = require("../models/Item");

// ─── GET /api/items ──────────────────────────────────────────────────────────
// Supports: ?search=, ?type=, ?category=, ?scalingGrade=, ?minStr=, ?minDex=,
//           ?minInt=, ?minFth=, ?page=, ?limit=, ?sort=
const getItems = async (req, res) => {
  try {
    const {
      search,
      type,
      category,
      scalingGrade,
      minStr,
      minDex,
      minInt,
      minFth,
      page = 1,
      limit = 20,
      sort = "name",
    } = req.query;

    const query = {};

    // Full-text search across name, description, effect
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Type filter: Weapon | Armor | Ring | Shield
    if (type) query.type = type;

    // Category filter (e.g. Greatsword, Helm)
    if (category) query.category = category;

    // Scaling grade filter — match any stat with that grade
    if (scalingGrade) {
      const gradeRegex = new RegExp(`^${scalingGrade}$`, "i");
      query.$or = [
        { "scaling.strength": gradeRegex },
        { "scaling.dexterity": gradeRegex },
        { "scaling.intelligence": gradeRegex },
        { "scaling.faith": gradeRegex },
      ];
    }

    // Minimum stat requirement filters (find items a player CAN use)
    if (minStr) query["requirements.strength"] = { $lte: Number(minStr) };
    if (minDex) query["requirements.dexterity"] = { $lte: Number(minDex) };
    if (minInt) query["requirements.intelligence"] = { $lte: Number(minInt) };
    if (minFth) query["requirements.faith"] = { $lte: Number(minFth) };

    // Sorting
    const sortMap = {
      name: { name: 1 },
      weight: { weight: 1 },
      "-weight": { weight: -1 },
      physical: { "baseDamage.physical": -1 },
    };
    const sortOption = sortMap[sort] || { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Item.find(query).sort(sortOption).skip(skip).limit(Number(limit)).lean(),
      Item.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/items/:id ──────────────────────────────────────────────────────
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/items (Admin only) ────────────────────────────────────────────
const createItem = async (req, res) => {
  try {
    const item = new Item({ ...req.body, isCustom: true, sourceApi: "manual" });
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/items/:id (Admin only) ─────────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/items/:id (Admin only) ──────────────────────────────────────
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/items/categories ───────────────────────────────────────────────
// Returns distinct categories for filter dropdowns
const getCategories = async (req, res) => {
  try {
    const categories = await Item.distinct("category");
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem, getCategories };
