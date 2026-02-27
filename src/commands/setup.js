import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildSetupEmbed } from '../utils/embedBuilder.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('このチャンネルに実践トラッカーのボタンを設置します')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  // 古いボタンメッセージがあれば削除
  const settings = settingsRepo.getSettings(interaction.guildId);
  if (settings.practice_message_id && settings.practice_channel_id) {
    try {
      const oldChannel = await interaction.client.channels.fetch(settings.practice_channel_id).catch(() => null);
      if (oldChannel) {
        const oldMessage = await oldChannel.messages.fetch(settings.practice_message_id).catch(() => null);
        if (oldMessage) {
          await oldMessage.delete();
        }
      }
    } catch (err) {
      // 古いメッセージが見つからなくても続行
    }
  }

  const { embed, row } = buildSetupEmbed();
  const message = await interaction.channel.send({ embeds: [embed], components: [row] });

  settingsRepo.setPracticeChannel(interaction.guildId, interaction.channelId, message.id);

  await interaction.reply({
    content: '✅ 実践トラッカーを設置しました！メンバーがボタンを押せるようになりました。',
    ephemeral: true,
  });
}
