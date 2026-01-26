const express = require("express")
const router = express.Router()
const Lead = require("../models/Lead")

// Create lead
let agentIndex = 0
const agents = ["Ravi","Aman","Suresh"]

router.post("/", async (req,res) => {
  try {

    // auto assign if Website lead
    if(req.body.source === "Website"){
      req.body.owner = agents[agentIndex]
      agentIndex = (agentIndex + 1) % agents.length
    }

    const lead = new Lead(req.body)
    await lead.save()
    res.json(lead)

  } catch(err) {
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
