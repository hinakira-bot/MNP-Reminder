import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as memberRepo from '../database/repositories/memberRepository.js';

export const data = new SlashCommandBuilder()
  .setName('register')
  .setDescription('メンバーを実践追跡対象に登録します')
  .addUserOption(option =>
    option.setName('user').setDescription('登録するメンバー').setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const target = interaction.options.getUser('user');
  if (target.bot) {
    return interaction.reply({ content: 'Botは登録できません。', ephemeral: true });
  }

  memberRepo.register(interaction.guildId, target.id, target.displayName || target.username);

  await interaction.reply({
    content: `✅ **${target.displayName || target.username}** さんを追跡対象に登録しました。`,
    ephemeral: true,
  });
}
