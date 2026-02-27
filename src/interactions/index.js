import { logger } from '../utils/logger.js';
import { handleButton } from './buttonHandler.js';

// 全インタラクションの重複防止
const processedInteractions = new Set();

export async function handleInteraction(interaction, commands) {
  // 同じインタラクションIDの二重処理を防ぐ
  if (processedInteractions.has(interaction.id)) {
    logger.warn(`重複インタラクション検出（グローバル）: ${interaction.id}`);
    return;
  }
  processedInteractions.add(interaction.id);
  setTimeout(() => processedInteractions.delete(interaction.id), 60000);

  try {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    }
  } catch (error) {
    logger.error(`インタラクションエラー: ${error.message}`, error.stack);
    const reply = { content: 'エラーが発生しました。もう一度お試しください。', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
}
