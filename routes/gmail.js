const express = require("express")
const router = express.Router()
const { google } = require("googleapis")

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

router.get("/connect", (req,res)=>{
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"]
  })

  res.redirect(url)
})

router.get("/callback", async (req,res)=>{
  const { code } = req.query

  const { tokens } = await oauth2Client.getToken(code)
  console.log("GMAIL TOKENS:", tokens)

  res.send("Gmail connected. You can close this tab.")
})

module.exports = router
