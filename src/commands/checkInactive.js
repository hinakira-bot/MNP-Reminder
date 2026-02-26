import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { runInactivityCheck } from '../scheduler/inactivityChecker.js';

export const data = new SlashCommandBuilder()
  .setName('check-inactive')
  .setDescription('手動で未実践メンバーのチェックとリマインドを実行します')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const result = await runInactivityCheck(interaction.guildId, interaction.client);

  if (result.error) {
    return interaction.editReply({ content: `❌ ${result.error}` });
  }

  if (result.count === 0) {
    return interaction.editReply({ content: '✅ 全メンバーが期間内に実践しています！リマインド不要です。' });
  }

  await interaction.editReply({
    content: `✅ ${result.count}人の未実践メンバーにリマインドを送信しました。`,
  });
}
