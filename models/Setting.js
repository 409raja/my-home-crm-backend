
const mongoose = require("mongoose")

const SettingSchema = new mongoose.Schema({
  key:String,
  value:Number
})

module.exports = mongoose.model("Setting", SettingSchema)

