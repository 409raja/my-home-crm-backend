const express = require("express")
const router = express.Router()
const { google } = require("googleapis")
const Lead = require("../models/Lead")
const User = require("../models/User")
const Setting = require("../models/Setting")

const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET,
"https://my-home-crm-backend.onrender.com/api/gmail/callback"
)

let tokens=null

async function assignAgent(){

const agents = await User.find({ role:"Agent", active:true })
if(!agents.length) return "Unassigned"

let setting = await Setting.findOne({ key:"gmailIndex" })

if(!setting){
setting = await Setting.create({ key:"gmailIndex", value:0 })
}

const agent = agents[ setting.value % agents.length ]

setting.value++
await setting.save()

return agent.name
}

router.get("/auth",(req,res)=>{
res.redirect(oauth2Client.generateAuthUrl({
access_type:"offline",
scope:["https://www.googleapis.com/auth/gmail.readonly"]
}))
})

router.get("/callback",async(req,res)=>{
const {tokens:t}=await oauth2Client.getToken(req.query.code)
tokens=t
oauth2Client.setCredentials(tokens)
res.send("Gmail connected")
})

router.get("/fetch",async(req,res)=>{

if(!tokens) return res.send("connect gmail first")

oauth2Client.setCredentials(tokens)
const gmail = google.gmail({version:"v1",auth:oauth2Client})

const list = await gmail.users.messages.list({userId:"me",maxResults:5})
if(!list.data.messages) return res.json({success:true})

for(const m of list.data.messages){

const msg = await gmail.users.messages.get({userId:"me",id:m.id})

let body = Buffer.from(
msg.data.payload.parts?.[0]?.body?.data||"",
"base64"
).toString("utf8")

const phone = body.match(/\b\d{10}\b/)?.[0]
if(!phone) continue

let name = body.match(/Name\s*[-:]\s*(.*)/i)?.[1] || "Gmail Lead"

let property="General Enquiry"
if(body.toLowerCase().includes("2bhk")) property="2BHK"
if(body.toLowerCase().includes("3bhk")) property="3BHK"

await Lead.create({
client:name.trim(),
phone,
property,
owner:await assignAgent(),
status:"New",
note:body,
source:"Gmail"
})
}

res.json({success:true})
})

module.exports = router
