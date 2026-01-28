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

for(const m of messages.data.messages){

// read email
const msg = await gmail.users.messages.get({
userId:"me",
id:m.id
})

const headers = msg.data.payload.headers

const from = headers.find(h=>h.name==="From")?.value || "Gmail Lead"
const subject = headers.find(h=>h.name==="Subject")?.value || "Property Enquiry"

const snippet = msg.data.snippet || ""

// clean client name
const client = from.split("<")[0].trim()

// phone
// Extract phone
const phoneMatch = snippet.match(/\b\d{10}\b/)
if(!phoneMatch) continue
const phone = phoneMatch[0]

// Try to extract name before phone
let name = "Gmail Lead"
const nameMatch = snippet.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/)

if(nameMatch){
  name = nameMatch[1]
}

// Property detection
let property = "General Enquiry"
if(snippet.toLowerCase().includes("2bhk")) property="2BHK"
if(snippet.toLowerCase().includes("3bhk")) property="3BHK"
if(snippet.toLowerCase().includes("villa")) property="Villa"

await Lead.create({
client,
phone,
property,
owner:"Website",
status:"New",
note:snippet,
source:"Gmail"
})

}

res.json({success:true})

})



module.exports = router
