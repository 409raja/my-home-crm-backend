const express = require("express")
const router = express.Router()
const { google } = require("googleapis")
const Lead = require("../models/Lead")

const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET,
"https://my-home-crm-backend.onrender.com/api/gmail/callback"
)

let tokens = null

router.get("/auth",(req,res)=>{
const url = oauth2Client.generateAuthUrl({
access_type:"offline",
scope:["https://www.googleapis.com/auth/gmail.readonly"]
})
res.redirect(url)
})

router.get("/callback",async(req,res)=>{
const { code } = req.query
const { tokens:tk } = await oauth2Client.getToken(code)
tokens = tk
oauth2Client.setCredentials(tokens)
res.send("Gmail connected successfully")
})

router.get("/fetch", async (req,res)=>{

if(!tokens) return res.status(401).send("Gmail not connected")

oauth2Client.setCredentials(tokens)
const gmail = google.gmail({version:"v1",auth:oauth2Client})

const messages = await gmail.users.messages.list({
userId:"me",
maxResults:5
})

if(!messages.data.messages) return res.json([])

for (const m of messages.data.messages) {

  const msg = await gmail.users.messages.get({
    userId: "me",
    id: m.id
  })

  const headers = msg.data.payload.headers || []

  const from = headers.find(h => h.name === "From")?.value || ""
  const subject = headers.find(h => h.name === "Subject")?.value || ""

  // Read email body safely
  let body = ""

  if (msg.data.payload.parts?.length) {
    body = Buffer.from(
      msg.data.payload.parts[0].body.data || "",
      "base64"
    ).toString("utf8")
  }

  // PHONE (10 digits)
  const phoneMatch = body.match(/\b\d{10}\b/)
  if (!phoneMatch) continue

  const phone = phoneMatch[0]

  // NAME (from email body first, fallback sender)
  let client = "Gmail Lead"

  const nameMatch = body.match(/Name\s*[-:]\s*(.*)/i)

  if (nameMatch) {
    client = nameMatch[1].trim()
  } else {
    client = from.split("<")[0].trim()
  }

  // PROPERTY
  let property = "General Enquiry"

  if (body.toLowerCase().includes("2bhk")) property = "2BHK"
  if (body.toLowerCase().includes("3bhk")) property = "3BHK"
  if (body.toLowerCase().includes("villa")) property = "Villa"

  const User = require("../models/User")

    const agents = await User.find({ role:"Agent", active:true })
    const assigned = agents.length ? agents[0].name : "Unassigned"

    await Lead.create({
    client,
    phone,
    property,
    owner: assigned,
    status:"New",
    note: body,
    source:"Gmail"
    })



}

res.json({success:true})

})



module.exports = router
