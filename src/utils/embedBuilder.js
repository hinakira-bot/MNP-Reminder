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

export function buildReminderEmbed(inactiveMembers, thresholdDays) {
  const lines = inactiveMembers.map((m) => {
    if (m.last_practice) {
      return `<@${m.user_id}> - 最後の実践: ${m.days_ago}日前`;
    }
    if (m.last_learning) {
      return `<@${m.user_id}> - 学習済み（${m.learning_days_ago}日前）、まだ実践なし`;
    }
    return `<@${m.user_id}> - まだ記録がありません`;
  });

  return new EmbedBuilder()
    .setTitle('📢 実践リマインダー')
    .setDescription(
      `以下のメンバーが **${thresholdDays}日以上** 実践を記録していません：\n\n` +
      lines.join('\n') +
      '\n\n実践チャンネルでボタンを押して記録しましょう！💪'
    )
    .setColor(COLORS.warning)
    .setTimestamp();
}

export function buildLearningReminderEmbed(member) {
  return new EmbedBuilder()
    .setTitle('📚 次は実践です！')
    .setDescription(
      `<@${member.user_id}> さん、学習お疲れ様でした！\n\n` +
      '次のステップは **店舗でのMNP契約** です。\n' +
      '学んだことを活かして、実践に挑戦してみましょう！\n\n' +
      '実践が完了したら「実践完了！」ボタンを押してください。'
    )
    .setColor(COLORS.success);
}
