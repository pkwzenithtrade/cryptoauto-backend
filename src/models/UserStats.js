const mongoose = require("mongoose");

const UserStatsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  totalSignals: {
    type: Number,
    default: 0
  },

  wins: {
    type: Number,
    default: 0
  },

  losses: {
    type: Number,
    default: 0
  },

  totalProfit: {
    type: Number,
    default: 0
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("UserStats", UserStatsSchema);
