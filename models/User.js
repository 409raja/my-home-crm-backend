const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
name:String,
phone:String
email:String,
password:String,
role:String,

empId:{
type:String,
unique:true
},

active:{
type:Boolean,
default:true
},

createdAt:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model("User",UserSchema)
