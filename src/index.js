import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { initializeSchema } from './database/schema.js';
import { closeDatabase } from './database/connection.js';
import { commands } from './commands/index.js';
import { handleInteraction } from './interactions/index.js';
import { startScheduler, scheduleForGuild, stopAll as stopScheduler } from './scheduler/cronManager.js';
import * as memberRepo from './database/repositories/memberRepository.js';

// Register all human members of a guild
async function syncGuildMembers(guild) {
  try {
    const members = await guild.members.fetch();
    let count = 0;
    for (const [, member] of members) {
      if (member.user.bot) continue;
      memberRepo.register(guild.id, member.id, member.displayName || member.user.username);
      count++;
    }
    logger.info(`メンバー同期完了: ${guild.name} → ${count}人登録`);
  } catch (err) {
    logger.warn(`メンバー同期失敗 (${guild.name}): ${err.message}`);
  }
}

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// Load commands into a Collection
const commandCollection = new Collection();
for (const command of commands) {
  commandCollection.set(command.data.name, command);
}

// Ready event
client.once('ready', async () => {
  logger.info(`ログイン完了: ${client.user.tag}`);
  logger.info(`${client.guilds.cache.size} サーバーに参加中`);

  // Initialize database
  initializeSchema();

  // Sync all guild members to tracking
  for (const [, guild] of client.guilds.cache) {
    await syncGuildMembers(guild);
  }

  // Start scheduler for all guilds
  const guildIds = client.guilds.cache.map(g => g.id);
  startScheduler(guildIds, client);
});

// Handle interactions (commands + buttons)
client.on('interactionCreate', (interaction) => {
  handleInteraction(interaction, commandCollection);
});

// Handle new guild joins (sync members + start scheduler)
client.on('guildCreate', async (guild) => {
  logger.info(`新しいサーバーに参加: ${guild.name} (${guild.id})`);
  await syncGuildMembers(guild);
  scheduleForGuild(guild.id, client);
});

// Handle new member joins (auto-register)
client.on('guildMemberAdd', (member) => {
  if (member.user.bot) return;
  memberRepo.register(member.guild.id, member.id, member.displayName || member.user.username);
  logger.info(`新メンバー自動登録: ${member.user.username} (${member.guild.name})`);
});

// Graceful shutdown
function shutdown() {
  logger.info('シャットダウン中...');
  stopScheduler();
  closeDatabase();
  client.destroy();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Login
client.login(config.token).catch((error) => {
  logger.error('ログイン失敗:', error.message);
  logger.error('DISCORD_TOKEN が正しいか確認してください。');
  process.exit(1);
});
