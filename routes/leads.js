const express = require("express")
const router = express.Router()
const Lead = require("../models/Lead")

// Create lead
const User = require("../models/User")

router.post("/", async (req,res) => {
try{

if(req.body.source==="Website" || req.body.source==="Gmail"){

const agents = await User.find({ role:"Agent", active:true })

if(agents.length){

const websiteCount = await Lead.countDocuments({ source: req.body.source })

req.body.owner = agents[websiteCount % agents.length].name

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

router.get("/count/:name", async(req,res)=>{
const count = await Lead.countDocuments({owner:req.params.name})
res.json({count})
})


module.exports = router
