import { logger } from '../utils/logger.js';
import { handleButton } from './buttonHandler.js';

export async function handleInteraction(interaction, commands) {
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
