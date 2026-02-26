import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { initializeSchema } from './database/schema.js';
import { closeDatabase } from './database/connection.js';
import { commands } from './commands/index.js';
import { handleInteraction } from './interactions/index.js';
import { startScheduler, scheduleForGuild, stopAll as stopScheduler } from './scheduler/cronManager.js';

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
client.once('ready', () => {
  logger.info(`ログイン完了: ${client.user.tag}`);
  logger.info(`${client.guilds.cache.size} サーバーに参加中`);

  // Initialize database
  initializeSchema();

  // Start scheduler for all guilds
  const guildIds = client.guilds.cache.map(g => g.id);
  startScheduler(guildIds, client);
});

// Handle interactions (commands + buttons)
client.on('interactionCreate', (interaction) => {
  handleInteraction(interaction, commandCollection);
});

// Handle new guild joins (start scheduler for new guild)
client.on('guildCreate', (guild) => {
  logger.info(`新しいサーバーに参加: ${guild.name} (${guild.id})`);
  scheduleForGuild(guild.id, client);
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
