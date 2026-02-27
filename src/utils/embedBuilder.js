import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const COLORS = {
  primary: 0x5865F2,   // Discord Blurple
  success: 0x57F287,   // Green
  warning: 0xFEE75C,   // Yellow
  danger: 0xED4245,    // Red
};

export function buildSetupEmbed() {
  const embed = new EmbedBuilder()
    .setTitle('MNP実践トラッカー')
    .setDescription(
      '**店舗でMNP契約をしたら「実践完了！」ボタンを押してください！**\n\n' +
      'あなたの実践がコミュニティの力になります。'
    )
    .setColor(COLORS.primary);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('mnp_practice_complete')
      .setLabel('実践完了！')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🎯'),
  );

  return { embed, row };
}

export function buildStatsEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(COLORS.primary)
    .setTimestamp();

  for (const field of fields) {
    embed.addFields(field);
  }

  return embed;
}

/**
 * 実践経験はあるが、しばらく実践していない
 */
export function buildPracticeInactiveReminderEmbed(members, thresholdDays) {
  const lines = members.map((m) =>
    `<@${m.user_id}> - 最後の実践: ${m.days_ago}日前`
  );

  return new EmbedBuilder()
    .setTitle('🔥 実践リマインダー')
    .setDescription(
      `以下のメンバーが **${thresholdDays}日以上** 実践を記録していません：\n\n` +
      lines.join('\n') +
      '\n\n継続は力なり！次の実践に挑戦しましょう！🚀'
    )
    .setColor(COLORS.danger)
    .setTimestamp();
}
