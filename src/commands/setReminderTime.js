import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';
import { reschedule } from '../scheduler/cronManager.js';

export const data = new SlashCommandBuilder()
  .setName('set-reminder-time')
  .setDescription('毎日のリマインドチェック時刻を設定します（JST）')
  .addStringOption(option =>
    option
      .setName('time')
      .setDescription('時刻（例: 09:00, 21:00）')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const time = interaction.options.getString('time');

  // Validate HH:MM format
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return interaction.reply({
      content: '❌ 時刻は HH:MM 形式で入力してください（例: 09:00, 21:00）',
      ephemeral: true,
    });
  }

  const [hours, minutes] = time.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return interaction.reply({
      content: '❌ 無効な時刻です。00:00〜23:59 の範囲で入力してください。',
      ephemeral: true,
    });
  }

  settingsRepo.setReminderTime(interaction.guildId, time);
  reschedule(interaction.guildId, interaction.client);

  await interaction.reply({
    content: `✅ リマインドチェック時刻を **${time}（JST）** に設定しました。`,
    ephemeral: true,
  });
}
