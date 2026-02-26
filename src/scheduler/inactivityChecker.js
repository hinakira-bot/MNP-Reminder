import { logger } from '../utils/logger.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';
import * as memberRepo from '../database/repositories/memberRepository.js';
import * as practiceRepo from '../database/repositories/practiceRepository.js';
import { buildReminderEmbed, buildLearningReminderEmbed } from '../utils/embedBuilder.js';

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

    // 1) Check members inactive for threshold days (no practice)
    const inactiveMembers = memberRepo.getInactiveMembers(guildId, settings.reminder_days);

    // 2) Check members who learned but haven't practiced (after threshold days)
    const learnedNotPracticed = practiceRepo.getMembersWhoLearnedButNotPracticed(guildId, settings.reminder_days);

    let totalCount = 0;

    // Send general inactivity reminder
    if (inactiveMembers.length > 0) {
      const embed = buildReminderEmbed(inactiveMembers, settings.reminder_days);
      await channel.send({ embeds: [embed] });
      totalCount += inactiveMembers.length;
      logger.info(`リマインド送信: ${inactiveMembers.length}人 (未実践 ${settings.reminder_days}日以上)`);
    }

    // Send specific "you learned but haven't practiced" reminders
    for (const member of learnedNotPracticed) {
      // Skip if already included in the general reminder
      const alreadyReminded = inactiveMembers.some(m => m.user_id === member.user_id);
      if (alreadyReminded) continue;

      const embed = buildLearningReminderEmbed(member);
      await channel.send({ embeds: [embed] });
      totalCount++;
    }

    return { count: totalCount };
  } catch (error) {
    logger.error(`リマインドチェックエラー (${guildId}): ${error.message}`);
    return { error: `エラーが発生しました: ${error.message}` };
  }
}
