const mongoose = require('mongoose');

const buildSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Links this build to a specific user
  },
  title: {
    type: String,
    required: [true, 'Please add a build title'],
    trim: true,
  },
  description: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  // Dark Souls Stats
  stats: {
    vigor: { type: Number, default: 10 },
    attunement: { type: Number, default: 10 },
    endurance: { type: Number, default: 10 },
    vitality: { type: Number, default: 10 },
    strength: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    faith: { type: Number, default: 10 },
    luck: { type: Number, default: 10 },
  },
  // We will store just the IDs of the items your partner fetches from the API
  equipment: {
    rightHand1: { type: String, default: null }, // Could be RAWG API Item ID
    leftHand1: { type: String, default: null },
    headArmor: { type: String, default: null },
    chestArmor: { type: String, default: null },
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Build', buildSchema);