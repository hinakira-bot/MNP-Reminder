import { getDatabase } from './connection.js';
import { logger } from '../utils/logger.js';

export function initializeSchema() {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id            TEXT PRIMARY KEY,
      reminder_days       INTEGER NOT NULL DEFAULT 3,
      reminder_channel_id TEXT,
      reminder_time       TEXT NOT NULL DEFAULT '09:00',
      practice_channel_id TEXT,
      practice_message_id TEXT,
      report_channel_id   TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tracked_members (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id        TEXT NOT NULL,
      user_id         TEXT NOT NULL,
      username        TEXT NOT NULL,
      reminder_days   INTEGER,
      registered_at   TEXT NOT NULL DEFAULT (datetime('now')),
      is_active       INTEGER NOT NULL DEFAULT 1,
      UNIQUE(guild_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_tracked_members_guild
      ON tracked_members(guild_id, is_active);

    CREATE TABLE IF NOT EXISTS practice_logs (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id        TEXT NOT NULL,
      user_id         TEXT NOT NULL,
      action_type     TEXT NOT NULL DEFAULT 'practice',
      practiced_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_practice_logs_user
      ON practice_logs(guild_id, user_id, practiced_at DESC);

    CREATE INDEX IF NOT EXISTS idx_practice_logs_guild_date
      ON practice_logs(guild_id, practiced_at DESC);

    CREATE INDEX IF NOT EXISTS idx_practice_logs_action
      ON practice_logs(guild_id, user_id, action_type, practiced_at DESC);
  `);

  // Migrations
  const migrations = [
    'ALTER TABLE guild_settings ADD COLUMN report_channel_id TEXT',
    'ALTER TABLE guild_settings ADD COLUMN practice_role_id TEXT',
    'ALTER TABLE tracked_members ADD COLUMN reminder_days INTEGER',
  ];
  for (const sql of migrations) {
    try { db.exec(sql); } catch { /* Column already exists */ }
  }

  logger.info('データベーススキーマを初期化しました');
}
