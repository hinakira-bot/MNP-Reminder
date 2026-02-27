import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import * as memberRepo from '../database/repositories/memberRepository.js';
import * as practiceRepo from '../database/repositories/practiceRepository.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';

// 重複インタラクション防止用セット（同じインタラクションIDの二重処理を防ぐ）
const processedInteractions = new Set();

export async function handleButton(interaction) {
  const { customId, guildId, user } = interaction;

  // 重複チェック：同じインタラクションIDが既に処理中なら無視
  if (processedInteractions.has(interaction.id)) {
    logger.warn(`重複インタラクション検出・スキップ: ${interaction.id}`);
    return;
  }
  processedInteractions.add(interaction.id);
  // 60秒後にセットから削除（メモリリーク防止）
  setTimeout(() => processedInteractions.delete(interaction.id), 60000);

  if (customId === 'mnp_practice_complete') {
    return handlePractice(interaction, guildId, user);
  }
}

async function handlePractice(interaction, guildId, user) {
  // Cooldown check
  const last = practiceRepo.getLastAction(guildId, user.id, 'practice');
  if (last) {
    const elapsed = (Date.now() - new Date(last.practiced_at + 'Z').getTime()) / 1000;
    if (elapsed < config.buttonCooldownSeconds) {
      try {
        await interaction.reply({ content: '🎯 既に記録済みです！', ephemeral: true });
      } catch (err) {
        // ignore
      }
      return;
    }
  }

  // Auto-register
  memberRepo.register(guildId, user.id, user.displayName || user.username);

  // Record practice
  practiceRepo.recordAction(guildId, user.id, 'practice');
  const count = practiceRepo.getMonthlyCount(guildId, user.id, 'practice');
  const totalCount = practiceRepo.getActionCount(guildId, user.id, 'practice');

  logger.info(`実践記録: ${user.username} (${guildId}) [interaction: ${interaction.id}]`);

  // Ephemeral confirmation to the user
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `🎯 **実践完了を記録しました！お疲れ様です！**\n今月の実践回数: **${count}回** ／ 累計: **${totalCount}回**`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `🎯 **実践完了を記録しました！お疲れ様です！**\n今月の実践回数: **${count}回** ／ 累計: **${totalCount}回**`,
        ephemeral: true,
      });
    }
  } catch (err) {
    logger.warn(`インタラクション応答失敗: ${err.message}`);
  }

  const settings = settingsRepo.getSettings(guildId);

  // Assign practice role if configured
  try {
    if (settings.practice_role_id) {
      const member = await interaction.guild.members.fetch(user.id);
      if (!member.roles.cache.has(settings.practice_role_id)) {
        await member.roles.add(settings.practice_role_id);
        logger.info(`ロール付与: ${user.username} に ${settings.practice_role_id}`);
      }
    }
  } catch (err) {
    logger.warn(`ロール付与失敗: ${err.message}`);
  }

  // Public celebration in report channel (or fallback to same channel)
  try {
    let reportChannel = interaction.channel;
    if (settings.report_channel_id) {
      reportChannel = await interaction.client.channels.fetch(settings.report_channel_id).catch(() => interaction.channel);
    }
    await reportChannel.send({
      content: `🎉 **${user.displayName || user.username}** さんがMNP実践を完了しました！（累計 ${totalCount}回目）`,
    });
  } catch (err) {
    logger.warn(`公開メッセージ送信失敗: ${err.message}`);
  }
}
