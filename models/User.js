const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["Owner", "Agent", "Manager", "Accountant"],
    required: true
  },

  phone: Number,

  empId: {
    type: String,
    unique: true
  },

  active: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("User", UserSchema)
