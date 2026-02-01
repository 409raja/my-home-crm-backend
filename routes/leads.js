const express = require("express")
const router = express.Router()
const Lead = require("../models/Lead")
const User = require("../models/User")
const Setting = require("../models/Setting")

async function assignAgent(){

const agents = await User.find({ role:"Agent", active:true })
if(!agents.length) return "Unassigned"

let setting = await Setting.findOne({ key:"leadIndex" })

if(!setting){
setting = await Setting.create({ key:"leadIndex", value:0 })
}

const agent = agents[ setting.value % agents.length ]

setting.value += 1
await setting.save()

return agent.name
}

// CREATE LEAD
router.post("/", async(req,res)=>{
try{

if(req.body.source==="Website" || req.body.source==="Gmail"){
req.body.owner = await assignAgent()
}

delete req.body._id

const lead = await Lead.create(req.body)
res.json(lead)

}catch(e){
console.log(e)
res.status(500).json(e)
}
})

// GET LEADS
router.get("/", async(req,res)=>{
const { role,name } = req.query

if(role==="Agent"){
return res.json(await Lead.find({ owner:name }))
}

res.json(await Lead.find())
})

// UPDATE
router.put("/:id", async(req,res)=>{
res.json(await Lead.findByIdAndUpdate(req.params.id,req.body,{new:true}))
})

// DELETE
router.delete("/:id", async(req,res)=>{
await Lead.findByIdAndDelete(req.params.id)
res.json({success:true})
})

module.exports = router
