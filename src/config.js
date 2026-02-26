import 'dotenv/config';

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`環境変数 ${key} が設定されていません。.env ファイルを確認してください。`);
  return value;
};

export const config = Object.freeze({
  token: required('DISCORD_TOKEN'),
  clientId: required('DISCORD_CLIENT_ID'),
  guildId: process.env.DISCORD_GUILD_ID || null,
  databasePath: process.env.DATABASE_PATH || './data/mnp-tracker.db',
  defaultReminderDays: parseInt(process.env.DEFAULT_REMINDER_DAYS || '3', 10),
  defaultReminderTime: process.env.DEFAULT_REMINDER_TIME || '09:00',
  timezone: process.env.TIMEZONE || 'Asia/Tokyo',
  buttonCooldownSeconds: parseInt(process.env.BUTTON_COOLDOWN_SECONDS || '60', 10),
});
