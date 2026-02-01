const mongoose = require("mongoose")

const counterSchema = new mongoose.Schema({
  name: String,
  index: Number
})

module.exports = mongoose.model("Counter", counterSchema)
