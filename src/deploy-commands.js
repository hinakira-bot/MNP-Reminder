import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { commands } from './commands/index.js';
import { logger } from './utils/logger.js';

const rest = new REST().setToken(config.token);
const commandData = commands.map(c => c.data.toJSON());

async function deploy() {
  try {
    logger.info(`${commandData.length} 個のコマンドを登録中...`);

    if (config.guildId) {
      // Guild-specific (instant, good for development)
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commandData },
      );
      logger.info(`サーバー ${config.guildId} にコマンドを登録しました。`);
    } else {
      // Global (takes up to 1 hour to propagate)
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commandData },
      );
      logger.info('グローバルにコマンドを登録しました（反映まで最大1時間かかります）。');
    }
  } catch (error) {
    logger.error('コマンド登録エラー:', error);
    process.exit(1);
  }
}

deploy();
