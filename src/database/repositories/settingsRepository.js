import { getDatabase } from '../connection.js';
import { config } from '../../config.js';

export function getSettings(guildId) {
  const db = getDatabase();
  let row = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
  if (!row) {
    db.prepare(
      'INSERT INTO guild_settings (guild_id, reminder_days, reminder_time) VALUES (?, ?, ?)'
    ).run(guildId, config.defaultReminderDays, config.defaultReminderTime);
    row = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
  }
  return row;
}

export function setReminderDays(guildId, days) {
  const db = getDatabase();
  getSettings(guildId);
  db.prepare(
    "UPDATE guild_settings SET reminder_days = ?, updated_at = datetime('now') WHERE guild_id = ?"
  ).run(days, guildId);
}

export function setReminderChannelId(guildId, channelId) {
  const db = getDatabase();
  getSettings(guildId);
  db.prepare(
    "UPDATE guild_settings SET reminder_channel_id = ?, updated_at = datetime('now') WHERE guild_id = ?"
  ).run(channelId, guildId);
}

export function setReminderTime(guildId, timeString) {
  const db = getDatabase();
  getSettings(guildId);
  db.prepare(
    "UPDATE guild_settings SET reminder_time = ?, updated_at = datetime('now') WHERE guild_id = ?"
  ).run(timeString, guildId);
}

export function setReportChannelId(guildId, channelId) {
  const db = getDatabase();
  getSettings(guildId);
  db.prepare(
    "UPDATE guild_settings SET report_channel_id = ?, updated_at = datetime('now') WHERE guild_id = ?"
  ).run(channelId, guildId);
}

export function setPracticeRoleId(guildId, roleId) {
  const db = getDatabase();
  getSettings(guildId);
  db.prepare(
    "UPDATE guild_settings SET practice_role_id = ?, updated_at = datetime('now') WHERE guild_id = ?"
  ).run(roleId, guildId);
}

export function setPracticeChannel(guildId, channelId, messageId) {
  const db = getDatabase();
  getSettings(guildId);
  db.prepare(
    "UPDATE guild_settings SET practice_channel_id = ?, practice_message_id = ?, updated_at = datetime('now') WHERE guild_id = ?"
  ).run(channelId, messageId, guildId);
}
