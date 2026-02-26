import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildSetupEmbed } from '../utils/embedBuilder.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('このチャンネルに実践トラッカーのボタンを設置します')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const { embed, row } = buildSetupEmbed();
  const message = await interaction.channel.send({ embeds: [embed], components: [row] });

  settingsRepo.setPracticeChannel(interaction.guildId, interaction.channelId, message.id);

  await interaction.reply({
    content: '✅ 実践トラッカーを設置しました！メンバーがボタンを押せるようになりました。',
    ephemeral: true,
  });
}
