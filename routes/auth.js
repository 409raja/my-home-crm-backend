const express = require("express")
const router = express.Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")

// Register
router.post("/register", async (req,res)=>{
  const user = new User({
    ...req.body,
    empId:"EMP"+Date.now()
    })

  await user.save()
  res.json(user)
})

// Create user
router.post("/create", async (req,res)=>{
  try{
    const user = new User({
    ...req.body,
    empId:"EMP"+Date.now()
    })

    await user.save()
    res.json(user)
  }catch(err){
    res.status(500).json(err)
  }
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

// Get all users
router.get("/users", async (req,res)=>{
  try{
    const users = await User.find()
    res.json(users)
  }catch(err){
    res.status(500).json(err)
  }
}
)

// Delete user
router.delete("/:id", async(req,res)=>{
await User.findByIdAndDelete(req.params.id)
res.json({success:true})
})
router.put("/disable/:id", async(req,res)=>{
await User.findByIdAndUpdate(req.params.id,{active:false})
res.json({success:true})
})
router.put("/enable/:id", async(req,res)=>{
await User.findByIdAndUpdate(req.params.id,{active:true})
res.json({success:true})
})


module.exports = router
