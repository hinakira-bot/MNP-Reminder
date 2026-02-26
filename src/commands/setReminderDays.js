import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';

export const data = new SlashCommandBuilder()
  .setName('set-reminder-days')
  .setDescription('リマインドの閾値（未実践日数）を設定します')
  .addIntegerOption(option =>
    option
      .setName('days')
      .setDescription('何日間未実践でリマインドするか（1〜30）')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(30)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const days = interaction.options.getInteger('days');
  settingsRepo.setReminderDays(interaction.guildId, days);

  await interaction.reply({
    content: `✅ リマインド閾値を **${days}日** に設定しました。${days}日以上未実践のメンバーにリマインドが送られます。`,
    ephemeral: true,
  });
}
