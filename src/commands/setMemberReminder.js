import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as memberRepo from '../database/repositories/memberRepository.js';

export const data = new SlashCommandBuilder()
  .setName('set-member-reminder')
  .setDescription('特定メンバーのリマインド閾値を個別に設定します')
  .addUserOption(option =>
    option.setName('user').setDescription('対象メンバー').setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('days')
      .setDescription('何日間未実践でリマインドするか（1〜30、0でサーバーデフォルトに戻す）')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(30)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const target = interaction.options.getUser('user');
  const days = interaction.options.getInteger('days');

  if (!memberRepo.isRegistered(interaction.guildId, target.id)) {
    return interaction.reply({
      content: `❌ **${target.displayName || target.username}** さんはまだ追跡対象に登録されていません。先にボタンを押すか、/register で登録してください。`,
      ephemeral: true,
    });
  }

  if (days === 0) {
    memberRepo.setMemberReminderDays(interaction.guildId, target.id, null);
    return interaction.reply({
      content: `✅ **${target.displayName || target.username}** さんのリマインド設定を **サーバーデフォルト** に戻しました。`,
      ephemeral: true,
    });
  }

  memberRepo.setMemberReminderDays(interaction.guildId, target.id, days);
  await interaction.reply({
    content: `✅ **${target.displayName || target.username}** さんのリマインド閾値を **${days}日** に設定しました。`,
    ephemeral: true,
  });
}
