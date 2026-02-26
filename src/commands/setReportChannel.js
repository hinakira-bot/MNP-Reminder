import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';

export const data = new SlashCommandBuilder()
  .setName('set-report-channel')
  .setDescription('実践報告を投稿するチャンネルを設定します')
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('実践報告先のテキストチャンネル')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  settingsRepo.setReportChannelId(interaction.guildId, channel.id);

  await interaction.reply({
    content: `✅ 実践報告チャンネルを <#${channel.id}> に設定しました。\n実践完了の公開メッセージがこのチャンネルに投稿されます。`,
    ephemeral: true,
  });
}
