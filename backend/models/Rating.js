const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    buildId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Build",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// A user can only rate a build once
ratingSchema.index({ buildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
