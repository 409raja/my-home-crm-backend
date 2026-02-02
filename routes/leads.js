const express = require("express")
const router = express.Router()
const Lead = require("../models/Lead")
const assignAgentRoundRobin = require("../utils/assignAgent")

// ================================
// CREATE LEAD (Manual / Website / Gmail)
// ================================
router.post("/", async (req, res) => {
  try {
    const { client, phone, property, source, note, status } = req.body

    // 🔥 backend decides owner (round robin)
    const assignedAgent = await assignAgentRoundRobin()

    const lead = await Lead.create({
      client,
      phone,
      property,
      note,
      status: status || "New",
      source,
      owner: assignedAgent
    })

    // populate so frontend immediately gets name
    const populatedLead = await Lead.findById(lead._id).populate(
      "owner",
      "name"
    )

    res.json(populatedLead)
  } catch (err) {
    console.error("Create lead error:", err)
    res.status(500).json({ msg: "Failed to create lead" })
  }
})

// ================================
// GET LEADS
// ================================
router.get("/", async (req, res) => {
  try {
    const { role, userId } = req.query

    let leads

    if (role === "Agent") {
      leads = await Lead.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate("owner", "name")
    } else {
      leads = await Lead.find()
        .sort({ createdAt: -1 })
        .populate("owner", "name")
    }

    res.json(leads)
  } catch (err) {
    console.error("Fetch leads error:", err)
    res.status(500).json({ msg: "Failed to fetch leads" })
  }
})

// ================================
// UPDATE LEAD
// ================================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("owner", "name")

    res.json(updated)
  } catch (err) {
    console.error("Update lead error:", err)
    res.status(500).json({ msg: "Failed to update lead" })
  }
})

// ================================
// DELETE LEAD
// ================================
router.delete("/:id", async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error("Delete lead error:", err)
    res.status(500).json({ msg: "Failed to delete lead" })
  }
})

module.exports = router
