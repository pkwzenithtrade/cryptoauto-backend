const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  password: String,
  plan: {
    type: String,
    default: "free"
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
