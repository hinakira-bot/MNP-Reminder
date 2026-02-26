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
      '**コンテンツで学んだら「学習完了」ボタンを押してください！**\n' +
      '**実際に店舗でMNP契約をしたら「実践完了」ボタンを押してください！**\n\n' +
      'あなたの実践がコミュニティの力になります。'
    )
    .setColor(COLORS.primary);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('mnp_learning_complete')
      .setLabel('学習完了')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📖'),
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
 * パターン1: 学習も実践もしていない（未着手メンバー）
 */
export function buildNotStartedReminderEmbed(members, thresholdDays) {
  const lines = members.map((m) =>
    `<@${m.user_id}> - 参加から${m.days_since_join}日経過`
  );

  return new EmbedBuilder()
    .setTitle('📖 学習リマインダー')
    .setDescription(
      `以下のメンバーがまだ学習を始めていません：\n\n` +
      lines.join('\n') +
      '\n\nまずはコンテンツで学習して「学習完了」ボタンを押しましょう！📖'
    )
    .setColor(COLORS.primary)
    .setTimestamp();
}

/**
 * パターン2: 学習済みだが実践していない
 */
export function buildLearnedNotPracticedReminderEmbed(members, thresholdDays) {
  const lines = members.map((m) =>
    `<@${m.user_id}> - 学習完了から${m.learning_days_ago}日経過`
  );

  return new EmbedBuilder()
    .setTitle('🎯 実践リマインダー')
    .setDescription(
      `以下のメンバーは学習済みですが、まだ実践していません：\n\n` +
      lines.join('\n') +
      '\n\n学んだことを活かして、店舗でMNP契約に挑戦しましょう！💪\n' +
      '実践が完了したら「実践完了！」ボタンを押してください。'
    )
    .setColor(COLORS.warning)
    .setTimestamp();
}

/**
 * パターン3: 実践経験はあるが、しばらく実践していない
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
