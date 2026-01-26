const mongoose = require("mongoose")

const LeadSchema = new mongoose.Schema({
  client: String,
  phone: String,
  property: String,
  owner: String,
  status: String,
  followup: String,
  note: String,
  source: String,
  amount: Number
})

module.exports = mongoose.model("Lead", LeadSchema)
