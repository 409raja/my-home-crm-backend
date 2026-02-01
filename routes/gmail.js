const express = require("express")
const router = express.Router()
const { google } = require("googleapis")
const axios = require("axios")

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://my-home-crm-backend.onrender.com/api/gmail/callback"
)

let tokens = null

router.get("/auth", (req, res) => {
  res.redirect(
    oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"]
    })
  )
})

router.get("/callback", async (req, res) => {
  const { tokens: t } = await oauth2Client.getToken(req.query.code)
  tokens = t
  oauth2Client.setCredentials(tokens)
  res.send("Gmail connected")
})

router.get("/fetch", async (req, res) => {
  if (!tokens) return res.send("Connect Gmail first")

  oauth2Client.setCredentials(tokens)
  const gmail = google.gmail({ version: "v1", auth: oauth2Client })

  const list = await gmail.users.messages.list({ userId: "me", maxResults: 5 })
  if (!list.data.messages) return res.json({ success: true })

  for (const m of list.data.messages) {
    const msg = await gmail.users.messages.get({ userId: "me", id: m.id })

    const body = Buffer.from(
      msg.data.payload.parts?.[0]?.body?.data || "",
      "base64"
    ).toString("utf8")

    const phone = body.match(/\b\d{10}\b/)?.[0]
    if (!phone) continue

    const name =
      body.match(/Name\s*[-:]\s*(.*)/i)?.[1] || "Gmail Lead"

    let property = "General Enquiry"
    if (body.toLowerCase().includes("2bhk")) property = "2BHK"
    if (body.toLowerCase().includes("3bhk")) property = "3BHK"

    // 🔥 SEND TO LEADS API (single source of truth)
    await axios.post(`${process.env.BACKEND_URL}/api/leads`, {
      client: name.trim(),
      phone,
      property,
      note: body,
      source: "Gmail"
    })
  }

  res.json({ success: true })
})

module.exports = router
