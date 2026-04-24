const mongoose = require("mongoose");

const UserStatsSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },

  totalProfit: { type: Number, default: 0 },

  history: [
    {
      coin: String,
      profit: Number,
      confidence: Number,
      time: String
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("UserStats", UserStatsSchema);
