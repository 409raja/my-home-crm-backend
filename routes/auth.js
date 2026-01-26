

const express = require("express")
const router = express.Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")

// Register
router.post("/register", async (req,res)=>{
  const user = new User(req.body)
  await user.save()
  res.json(user)
})

// Login
router.post("/login", async (req,res)=>{
  const { email, password } = req.body
  const user = await User.findOne({ email, password })

  if(!user) return res.status(401).json({msg:"Invalid"})

  const token = jwt.sign(
    { id:user._id, role:user.role, name:user.name },
    "secret123"
  )

  res.json({
    token,
    user:{
      name:user.name,
      role:user.role,
      email:user.email
    }
  })
})
module.exports = router
