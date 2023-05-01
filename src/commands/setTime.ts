import { getTimeZones } from '@vvo/tzdb';
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
    console.log('Step 1');
    const cityName = interaction.data.options[0].value.toLowerCase();
    const zones = getTimeZones({ includeUtc: true });

    console.log('Step 2');
    const requestedZone = zones.find(z => z.mainCities.some(c => c.toLowerCase() === cityName));

    if (requestedZone === undefined) {
      return 'City name could not be found';
    }

    console.log('Step 3');
    // If we're here, the city name was valid and we can go forward with writing the information
    return 'City name was valid! Functionality coming later';
  }
} as CommandDescription
