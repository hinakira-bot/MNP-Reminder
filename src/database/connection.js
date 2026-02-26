import { DatabaseSync } from 'node:sqlite';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

let db;

export function getDatabase() {
  if (!db) {
    db = new DatabaseSync(config.databasePath);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    logger.info(`SQLite データベースに接続: ${config.databasePath}`);
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    logger.info('データベース接続を閉じました');
  }
}
