const User = require("../models/User")
const Counter = require("../models/Counter")

const assignAgentRoundRobin = async () => {
  const agents = await User.find({
    role: "Agent",
    active: true
  }).sort({ createdAt: 1 })

  if (!agents.length) return null

  let counter = await Counter.findOne({ name: "agentRotation" })

  if (!counter) {
    counter = await Counter.create({
      name: "agentRotation",
      index: 0
    })
  }

  const agent = agents[counter.index % agents.length]

  counter.index += 1
  await counter.save()

  return agent._id
}

module.exports = assignAgentRoundRobin
