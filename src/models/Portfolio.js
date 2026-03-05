const mongoose = require("mongoose")

const PortfolioSchema = new mongoose.Schema({
  userId: String,
  coin: String,
  amount: Number
})

module.exports = mongoose.model("Portfolio", PortfolioSchema)
