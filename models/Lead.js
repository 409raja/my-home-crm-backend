const mongoose = require("mongoose")

const LeadSchema = new mongoose.Schema({
  client: String,
  phone: String,
  property: String,

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    default: "New"
  },

  followup: String,
  note: String,
  source: String,
  amount: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Lead", LeadSchema)
