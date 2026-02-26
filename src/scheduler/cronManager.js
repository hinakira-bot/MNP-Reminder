import cron from 'node-cron';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { runInactivityCheck } from './inactivityChecker.js';
import * as settingsRepo from '../database/repositories/settingsRepository.js';

const jobs = new Map();

export function startScheduler(guildIds, client) {
  for (const guildId of guildIds) {
    scheduleForGuild(guildId, client);
  }
  logger.info(`スケジューラー開始: ${guildIds.length} サーバー`);
}

export function scheduleForGuild(guildId, client) {
  // Stop existing job if any
  stopJob(guildId);

  const settings = settingsRepo.getSettings(guildId);
  const time = settings.reminder_time || config.defaultReminderTime;
  const [hours, minutes] = time.split(':');

  const cronExpression = `${minutes} ${hours} * * *`;

  if (!cron.validate(cronExpression)) {
    logger.error(`無効なcron式: ${cronExpression} (guild: ${guildId})`);
    return;
  }

  const job = cron.schedule(cronExpression, async () => {
    logger.info(`定期リマインドチェック実行: ${guildId}`);
    await runInactivityCheck(guildId, client);
  }, {
    timezone: config.timezone,
  });

  jobs.set(guildId, job);
  logger.info(`スケジュール設定: ${guildId} → 毎日 ${time} (${config.timezone})`);
}

export function reschedule(guildId, client) {
  scheduleForGuild(guildId, client);
}

function stopJob(guildId) {
  const existing = jobs.get(guildId);
  if (existing) {
    existing.stop();
    jobs.delete(guildId);
  }
}

export function stopAll() {
  for (const [guildId, job] of jobs) {
    job.stop();
    logger.info(`スケジュール停止: ${guildId}`);
  }
  jobs.clear();
}
