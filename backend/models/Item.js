const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Straight Sword",
        "Greatsword",
        "Ultra Greatsword",
        "Curved Sword",
        "Katana",
        "Thrusting Sword",
        "Axe",
        "Greataxe",
        "Hammer",
        "Great Hammer",
        "Spear",
        "Halberd",
        "Reaper",
        "Whip",
        "Fist",
        "Claw",
        "Bow",
        "Crossbow",
        "Catalyst",
        "Talisman",
        "Shield",
        "Greatshield",
        "Helm",
        "Chest Armor",
        "Gauntlets",
        "Leg Armor",
        "Ring",
      ],
    },
    type: {
      type: String,
      enum: ["Weapon", "Armor", "Ring", "Shield"],
      required: true,
    },
    weight: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    description: { type: String, default: "" },

    // Scaling grades (weapons only)
    scaling: {
      strength: {
        type: String,
        enum: ["S", "A", "B", "C", "D", "E", "-"],
        default: "-",
      },
      dexterity: {
        type: String,
        enum: ["S", "A", "B", "C", "D", "E", "-"],
        default: "-",
      },
      intelligence: {
        type: String,
        enum: ["S", "A", "B", "C", "D", "E", "-"],
        default: "-",
      },
      faith: {
        type: String,
        enum: ["S", "A", "B", "C", "D", "E", "-"],
        default: "-",
      },
    },

    // Minimum stat requirements
    requirements: {
      strength: { type: Number, default: 0 },
      dexterity: { type: Number, default: 0 },
      intelligence: { type: Number, default: 0 },
      faith: { type: Number, default: 0 },
    },

    // Base damage (weapons/shields)
    baseDamage: {
      physical: { type: Number, default: 0 },
      magic: { type: Number, default: 0 },
      fire: { type: Number, default: 0 },
      lightning: { type: Number, default: 0 },
    },

    // Defense (armor)
    defense: {
      physical: { type: Number, default: 0 },
      magic: { type: Number, default: 0 },
      fire: { type: Number, default: 0 },
      lightning: { type: Number, default: 0 },
    },

    // Ring effects
    effect: { type: String, default: "" },

    isCustom: { type: Boolean, default: false }, // manually added by admin vs API-fetched
    sourceApi: { type: String, default: "manual" },
    externalId: { type: String, default: "" },
  },
  { timestamps: true }
);

// Text index for search
itemSchema.index({ name: "text", description: "text", effect: "text" });

module.exports = mongoose.model("Item", itemSchema);
