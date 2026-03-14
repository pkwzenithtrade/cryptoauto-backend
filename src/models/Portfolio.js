const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true
  },

  coin: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("Portfolio", PortfolioSchema);
