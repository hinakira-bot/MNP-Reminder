import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';

export const data = new SlashCommandBuilder()
  .setName('set-practice-role')
  .setDescription('実践完了時に付与するロールを設定します')
  .addRoleOption(option =>
    option.setName('role').setDescription('付与するロール').setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const role = interaction.options.getRole('role');

  // Check if bot can manage this role
  const botMember = await interaction.guild.members.fetchMe();
  if (role.position >= botMember.roles.highest.position) {
    return interaction.reply({
      content: `❌ Bot のロールより上位のロール **${role.name}** は付与できません。\nBot のロールを **${role.name}** より上に移動してください。`,
      ephemeral: true,
    });
  }

  settingsRepo.setPracticeRoleId(interaction.guildId, role.id);

  await interaction.reply({
    content: `✅ 実践完了時に **${role.name}** ロールが付与されるようになりました。`,
    ephemeral: true,
  });
}
