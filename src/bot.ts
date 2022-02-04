import { config } from 'dotenv'
config()
require('cross-fetch/polyfill')
import { Client, Intents } from 'discord.js'
import { exportRoles } from './export-roles'
import { issuanceAgent } from './issuance-agent'

// https://stackoverflow.com/a/67799671/10571155
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
})

client.on('interactionCreate', exportRoles)

client.once('ready', async () => {
  const bot = await issuanceAgent.didManagerGetOrCreate({ alias: 'bot' })
  console.log('Ready!')
  console.log(bot.did)
  console.log(
    `Invite URL: https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot%20applications.commands&permissions=2415919104`,
  )
})

client.login(process.env.DISCORD_TOKEN)
