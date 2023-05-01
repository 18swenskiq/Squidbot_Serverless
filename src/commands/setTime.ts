import { CommandDescription } from '../discord_api/command';
import { Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_time')
    .setDescription('Sets your time zone, to be used with the /times command')
    .addStringOption(option => option
      .setName('city')
      .setDescription('A city that you are in the time zone of. Try to select the biggest city you share a timezone with.')
      .setRequired(true)),
  execute (interaction: Interaction): string {
    const cityName = interaction.data.options[0].value; // There will only be one argument
    return `You passed the city name: ${cityName}`;
  }
} as CommandDescription
