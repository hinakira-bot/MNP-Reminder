import { logger } from '../utils/logger.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';
import * as memberRepo from '../database/repositories/memberRepository.js';
import {
  buildLearnedNotPracticedReminderEmbed,
  buildPracticeInactiveReminderEmbed,
} from '../utils/embedBuilder.js';

export async function runInactivityCheck(guildId, client) {
  try {
    const settings = settingsRepo.getSettings(guildId);

    if (!settings.reminder_channel_id) {
      return { error: 'リマインドチャンネルが設定されていません。/set-reminder-channel で設定してください。' };
    }

    const channel = await client.channels.fetch(settings.reminder_channel_id).catch(() => null);
    if (!channel) {
      return { error: 'リマインドチャンネルが見つかりません。再設定してください。' };
    }

    const defaultDays = settings.reminder_days;
    let totalCount = 0;

    // パターン1: 学習済みだが実践していない（個別閾値対応）
    const learnedNotPracticed = memberRepo.getMembersLearnedNotPracticed(guildId, defaultDays);
    if (learnedNotPracticed.length > 0) {
      const embed = buildLearnedNotPracticedReminderEmbed(learnedNotPracticed, defaultDays);
      await channel.send({ embeds: [embed] });
      totalCount += learnedNotPracticed.length;
      logger.info(`リマインド送信: ${learnedNotPracticed.length}人 (学習済み・未実践)`);
    }

    // パターン2: 実践経験はあるが、しばらく実践していない（個別閾値対応）
    const practiceInactive = memberRepo.getMembersPracticeInactive(guildId, defaultDays);
    if (practiceInactive.length > 0) {
      const embed = buildPracticeInactiveReminderEmbed(practiceInactive, defaultDays);
      await channel.send({ embeds: [embed] });
      totalCount += practiceInactive.length;
      logger.info(`リマインド送信: ${practiceInactive.length}人 (実践が${defaultDays}日以上前)`);
    }

    return { count: totalCount };
  } catch (error) {
    logger.error(`リマインドチェックエラー (${guildId}): ${error.message}`);
    return { error: `エラーが発生しました: ${error.message}` };
  }
}
