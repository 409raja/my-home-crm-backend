const express = require("express")
const router = express.Router()
const Lead = require("../models/Lead")
const assignAgentRoundRobin = require("../utils/assignAgent")

// CREATE LEAD (ONLY PLACE ASSIGNMENT HAPPENS)
router.post("/", async (req, res) => {
  try {
    const { client, phone, property, source, note } = req.body

    const assignedAgent = await assignAgentRoundRobin()

    const lead = await Lead.create({
      client,
      phone,
      property,
      note,
      source,
      owner: assignedAgent
    })

    res.json(lead)
  } catch (err) {
    res.status(500).json(err)
  }
})

// GET LEADS
router.get("/", async (req, res) => {
  const { role, userId } = req.query

  let leads
  if (role === "Agent") {
    leads = await Lead.find({ owner: userId }).populate("owner", "name")
  } else {
    leads = await Lead.find().populate("owner", "name")
  }

  res.json(leads)
})

router.put("/:id", async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(lead)
})

router.delete("/:id", async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

module.exports = router
