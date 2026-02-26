import { SlashCommandBuilder } from 'discord.js';
import * as practiceRepo from '../database/repositories/practiceRepository.js';
import { buildStatsEmbed } from '../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('実践の統計・ランキングを表示します')
  .addUserOption(option =>
    option.setName('user').setDescription('特定のメンバーの統計を見る（省略でランキング）')
  )
  .addIntegerOption(option =>
    option
      .setName('period')
      .setDescription('集計期間（日数）')
      .addChoices(
        { name: '7日間', value: 7 },
        { name: '30日間', value: 30 },
        { name: '全期間', value: 9999 },
      )
  );

export async function execute(interaction) {
  const target = interaction.options.getUser('user');
  const period = interaction.options.getInteger('period') || 30;

  if (target) {
    return showUserStats(interaction, target, period);
  }
  return showLeaderboard(interaction, period);
}

async function showUserStats(interaction, target, period) {
  const practiceCount = practiceRepo.getActionCount(interaction.guildId, target.id, 'practice');
  const learningCount = practiceRepo.getActionCount(interaction.guildId, target.id, 'learning');
  const monthlyPractice = practiceRepo.getMonthlyCount(interaction.guildId, target.id, 'practice');
  const monthlyLearning = practiceRepo.getMonthlyCount(interaction.guildId, target.id, 'learning');
  const lastPractice = practiceRepo.getLastAction(interaction.guildId, target.id, 'practice');
  const lastLearning = practiceRepo.getLastAction(interaction.guildId, target.id, 'learning');

  const fields = [
    { name: '🎯 実践回数（累計 / 今月）', value: `${practiceCount}回 / ${monthlyPractice}回`, inline: true },
    { name: '📖 学習回数（累計 / 今月）', value: `${learningCount}回 / ${monthlyLearning}回`, inline: true },
  ];

  if (lastPractice) {
    fields.push({ name: '最終実践', value: lastPractice.practiced_at.replace('T', ' ').slice(0, 16) + ' (UTC)', inline: false });
  }
  if (lastLearning) {
    fields.push({ name: '最終学習', value: lastLearning.practiced_at.replace('T', ' ').slice(0, 16) + ' (UTC)', inline: false });
  }

  const embed = buildStatsEmbed(
    `📊 ${target.displayName || target.username} の統計`,
    '',
    fields,
  );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showLeaderboard(interaction, period) {
  const leaderboard = practiceRepo.getLeaderboard(interaction.guildId, period);
  const periodLabel = period >= 9999 ? '全期間' : `${period}日間`;

  if (leaderboard.length === 0) {
    return interaction.reply({ content: 'まだ記録がありません。', ephemeral: true });
  }

  const medals = ['🥇', '🥈', '🥉'];
  const lines = leaderboard.map((entry, i) => {
    const rank = medals[i] || `**${i + 1}.**`;
    return `${rank} ${entry.username} - 実践 **${entry.practice_count}回** ／ 学習 ${entry.learning_count}回`;
  });

  const embed = buildStatsEmbed(
    `🏆 実践ランキング（${periodLabel}）`,
    lines.join('\n'),
  );

  await interaction.reply({ embeds: [embed] });
}
