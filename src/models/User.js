const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email inválido"]
  },

  password: {
    type: String,
    required: true
  },

  plan: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
