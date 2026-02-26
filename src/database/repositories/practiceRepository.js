import { getDatabase } from '../connection.js';

/**
 * @param {'practice' | 'learning'} actionType
 */
export function recordAction(guildId, userId, actionType = 'practice') {
  const db = getDatabase();
  db.prepare(
    'INSERT INTO practice_logs (guild_id, user_id, action_type) VALUES (?, ?, ?)'
  ).run(guildId, userId, actionType);
}

export function getLastAction(guildId, userId, actionType = 'practice') {
  const db = getDatabase();
  return db.prepare(
    'SELECT * FROM practice_logs WHERE guild_id = ? AND user_id = ? AND action_type = ? ORDER BY practiced_at DESC LIMIT 1'
  ).get(guildId, userId, actionType);
}

export function getActionCount(guildId, userId, actionType = 'practice') {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT COUNT(*) AS count FROM practice_logs WHERE guild_id = ? AND user_id = ? AND action_type = ?'
  ).get(guildId, userId, actionType);
  return row.count;
}

export function getMonthlyCount(guildId, userId, actionType = 'practice') {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT COUNT(*) AS count FROM practice_logs
    WHERE guild_id = ? AND user_id = ? AND action_type = ?
      AND practiced_at >= datetime('now', 'start of month')
  `).get(guildId, userId, actionType);
  return row.count;
}

export function getLeaderboard(guildId, days = 30, limit = 10) {
  const db = getDatabase();
  return db.prepare(`
    SELECT
      tm.user_id,
      tm.username,
      COUNT(CASE WHEN pl.action_type = 'practice' THEN 1 END) AS practice_count,
      COUNT(CASE WHEN pl.action_type = 'learning' THEN 1 END) AS learning_count
    FROM tracked_members tm
    LEFT JOIN practice_logs pl
      ON tm.guild_id = pl.guild_id
     AND tm.user_id = pl.user_id
     AND pl.practiced_at >= datetime('now', ? || ' days')
    WHERE tm.guild_id = ?
      AND tm.is_active = 1
    GROUP BY tm.user_id
    ORDER BY practice_count DESC, learning_count DESC
    LIMIT ?
  `).all(`-${days}`, guildId, limit);
}

export function getTodayCount(guildId) {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT COUNT(DISTINCT user_id) AS count FROM practice_logs
    WHERE guild_id = ? AND action_type = 'practice'
      AND practiced_at >= datetime('now', 'start of day')
  `).get(guildId);
  return row.count;
}
