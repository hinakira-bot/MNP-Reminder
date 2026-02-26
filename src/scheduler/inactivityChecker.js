import { logger } from '../utils/logger.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';
import * as memberRepo from '../database/repositories/memberRepository.js';
import {
  buildNotStartedReminderEmbed,
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

    const days = settings.reminder_days;
    let totalCount = 0;

    // パターン1: 学習も実践もしていない（未着手）
    const notStarted = memberRepo.getMembersNotStarted(guildId, days);
    if (notStarted.length > 0) {
      const embed = buildNotStartedReminderEmbed(notStarted, days);
      await channel.send({ embeds: [embed] });
      totalCount += notStarted.length;
      logger.info(`リマインド送信: ${notStarted.length}人 (未着手)`);
    }

    // パターン2: 学習済みだが実践していない
    const learnedNotPracticed = memberRepo.getMembersLearnedNotPracticed(guildId, days);
    if (learnedNotPracticed.length > 0) {
      const embed = buildLearnedNotPracticedReminderEmbed(learnedNotPracticed, days);
      await channel.send({ embeds: [embed] });
      totalCount += learnedNotPracticed.length;
      logger.info(`リマインド送信: ${learnedNotPracticed.length}人 (学習済み・未実践)`);
    }

    // パターン3: 実践経験はあるが、しばらく実践していない
    const practiceInactive = memberRepo.getMembersPracticeInactive(guildId, days);
    if (practiceInactive.length > 0) {
      const embed = buildPracticeInactiveReminderEmbed(practiceInactive, days);
      await channel.send({ embeds: [embed] });
      totalCount += practiceInactive.length;
      logger.info(`リマインド送信: ${practiceInactive.length}人 (実践が${days}日以上前)`);
    }

    return { count: totalCount };
  } catch (error) {
    logger.error(`リマインドチェックエラー (${guildId}): ${error.message}`);
    return { error: `エラーが発生しました: ${error.message}` };
  }
}
