import { getDatabase } from '../connection.js';

export function register(guildId, userId, username) {
  const db = getDatabase();
  db.prepare(
    'INSERT OR IGNORE INTO tracked_members (guild_id, user_id, username) VALUES (?, ?, ?)'
  ).run(guildId, userId, username);
  // Update username if already exists (name may have changed)
  db.prepare(
    'UPDATE tracked_members SET username = ?, is_active = 1 WHERE guild_id = ? AND user_id = ?'
  ).run(username, guildId, userId);
}

export function unregister(guildId, userId) {
  const db = getDatabase();
  db.prepare(
    'UPDATE tracked_members SET is_active = 0 WHERE guild_id = ? AND user_id = ?'
  ).run(guildId, userId);
}

export function isRegistered(guildId, userId) {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT 1 FROM tracked_members WHERE guild_id = ? AND user_id = ? AND is_active = 1'
  ).get(guildId, userId);
  return !!row;
}

export function getAllTracked(guildId) {
  const db = getDatabase();
  return db.prepare(
    'SELECT * FROM tracked_members WHERE guild_id = ? AND is_active = 1 ORDER BY registered_at'
  ).all(guildId);
}

export function getInactiveMembers(guildId, thresholdDays) {
  const db = getDatabase();
  return db.prepare(`
    SELECT
      tm.user_id,
      tm.username,
      MAX(CASE WHEN pl.action_type = 'practice' THEN pl.practiced_at END) AS last_practice,
      MAX(CASE WHEN pl.action_type = 'learning' THEN pl.practiced_at END) AS last_learning,
      CAST(julianday('now') - julianday(
        MAX(CASE WHEN pl.action_type = 'practice' THEN pl.practiced_at END)
      ) AS INTEGER) AS days_ago,
      CAST(julianday('now') - julianday(
        MAX(CASE WHEN pl.action_type = 'learning' THEN pl.practiced_at END)
      ) AS INTEGER) AS learning_days_ago
    FROM tracked_members tm
    LEFT JOIN practice_logs pl
      ON tm.guild_id = pl.guild_id AND tm.user_id = pl.user_id
    WHERE tm.guild_id = ?
      AND tm.is_active = 1
    GROUP BY tm.user_id
    HAVING last_practice IS NULL
       OR last_practice < datetime('now', ? || ' days')
  `).all(guildId, `-${thresholdDays}`);
}
