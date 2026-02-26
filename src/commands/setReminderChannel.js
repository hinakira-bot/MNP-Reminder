import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';

export const data = new SlashCommandBuilder()
  .setName('set-reminder-channel')
  .setDescription('リマインドを投稿するチャンネルを設定します')
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('リマインド先のテキストチャンネル')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  settingsRepo.setReminderChannelId(interaction.guildId, channel.id);

  await interaction.reply({
    content: `✅ リマインドチャンネルを <#${channel.id}> に設定しました。`,
    ephemeral: true,
  });
}
