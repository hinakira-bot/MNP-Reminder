import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as memberRepo from '../database/repositories/memberRepository.js';

export const data = new SlashCommandBuilder()
  .setName('unregister')
  .setDescription('メンバーを実践追跡対象から外します')
  .addUserOption(option =>
    option.setName('user').setDescription('解除するメンバー').setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const target = interaction.options.getUser('user');
  memberRepo.unregister(interaction.guildId, target.id);

  await interaction.reply({
    content: `✅ **${target.displayName || target.username}** さんを追跡対象から外しました。`,
    ephemeral: true,
  });
}
