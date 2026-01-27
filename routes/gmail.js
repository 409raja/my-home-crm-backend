const express = require("express")
const router = express.Router()
const { google } = require("googleapis")

router.get("/auth", (req,res)=>{

const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET,
"https://my-home-crm-backend.onrender.com/api/gmail/callback"
)

const url = oauth2Client.generateAuthUrl({
access_type:"offline",
scope:["https://www.googleapis.com/auth/gmail.readonly"]
})

res.redirect(url)

})

router.get("/callback",(req,res)=>{
res.send("Gmail connected successfully")
})

module.exports = router
