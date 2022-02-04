import { config } from 'dotenv'
config()
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { exportRolesCommand } from './export-roles'

if (!process.env.DISCORD_TOKEN) throw Error('DISCORD_TOKEN is missing')
if (!process.env.DISCORD_CLIENT_ID) throw Error('DISCORD_CLIENT_ID is missing')
if (!process.env.DISCORD_GUILD_ID) throw Error('DISCORD_GUILD_ID is missing')

const commands = [exportRolesCommand.toJSON()]

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)

const main = async () => {
  await rest.put(
    // Routes.applicationCommands(
    //   process.env.DISCORD_CLIENT_ID as string
    // ),
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID as string,
      process.env.DISCORD_GUILD_ID as string,
    ),
    { body: commands },
  )

  console.log('Successfully registered application commands.')
}

main().catch(console.error)
