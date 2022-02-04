import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, MessageAttachment, GuildMemberRoleManager } from 'discord.js'
import { issuanceAgent } from './issuance-agent'

export const exportRolesCommand = new SlashCommandBuilder()
  .setName('export-roles')
  .setDescription('Issues role credentials')

export async function exportRoles(interaction: Interaction) {
  if (!interaction.isCommand()) return
  if (!interaction.inGuild()) return
  if (interaction.commandName !== exportRolesCommand.name) return

  const issuer = await issuanceAgent.didManagerGetOrCreate({
    alias: 'bot',
  })

  const roles = interaction.member.roles as GuildMemberRoleManager

  const promises = roles.cache
    .filter((role) => role.name !== '@everyone')
    .map(async (role): Promise<MessageAttachment> => {
      const { name, color, guild } = role

      const vc = await issuanceAgent.createVerifiableCredential({
        save: false,
        proofFormat: 'jwt',
        credential: {
          id: interaction.id,
          credentialSubject: {
            name,
            color,
            guild: {
              id: guild.id,
              name: guild.name,
              avatar: guild.iconURL({ format: 'png' }) || '',
            },
            id: interaction.member.user.id,
          },
          issuer: { id: issuer.did },
          issuanceDate: new Date().toISOString(),
          expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(), // 10 minutes
          type: ['VerifiableCredential', 'DiscordRole'],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
        },
      })

      return new MessageAttachment(
        Buffer.from(vc.proof.jwt),
        `${guild.name}-${role.name}-${interaction.member.user.username}-vc.jwt`,
      )
    })

  const attachments = await Promise.all(promises)

  await interaction.reply({
    ephemeral: true,
    content: 'Exported Role credentials',
    files: attachments,
  })
}
