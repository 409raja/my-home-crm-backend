const express = require("express")
const router = express.Router()
const Lead = require("../models/Lead")

// Create lead
const User = require("../models/User")

let agentIndex = 0

router.post("/", async (req,res) => {
try{

if(req.body.source==="Website"){

const agents = await User.find({ role:"Agent" })

if(agents.length>0){
req.body.owner = agents[agentIndex % agents.length].name
agentIndex++
}

}

const lead = new Lead(req.body)
await lead.save()
res.json(lead)

}catch(err){
res.status(500).json(err)
}
})


// Get all leads
/*
router.get("/", async (req,res) => {
  try {
    const leads = await Lead.find()
    res.json(leads)
  } catch(err) {
    res.status(500).json(err)
  }
})
*/

router.get("/", async (req,res)=>{
  try{
    const { role, name } = req.query

    let leads

    if(role==="Agent"){
      leads = await Lead.find({ owner:name })
    } else {
      leads = await Lead.find()
    }

    res.json(leads)

  }catch(err){
    res.status(500).json(err)
  }
})

// Update lead
router.put("/:id", async (req,res)=>{
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {new:true})
    res.json(lead)
  } catch(err) {
    res.status(500).json(err)
  }
})
// Delete lead
router.delete("/:id", async (req,res)=>{
  try{
    await Lead.findByIdAndDelete(req.params.id)
    res.json({success:true})
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = router
