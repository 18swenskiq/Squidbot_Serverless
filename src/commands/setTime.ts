import { getTimeZones } from '@vvo/tzdb';
import { CommandDescription } from '../discord_api/command';
import { Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { Database } from '../util/database';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_time')
    .setDescription('Sets your time zone, to be used with the /times command')
    .addStringOption(option => option
      .setName('city')
      .setDescription('A city that you are in the time zone of. Try to select the biggest city you share a timezone with.')
      .setRequired(true)),
  async execute (interaction: Interaction): Promise<string> {
    const cityName = interaction.data.options[0].value.toLowerCase();
    const zones = getTimeZones({ includeUtc: true });

    let requestedZone = zones.find(z => z.mainCities.some(c => c.toLowerCase() === cityName));

    if (requestedZone === undefined) {
      // If it wasn't in the main cities, let's try searching the name directly
      requestedZone = zones.find(z => z.group.some(c => c.toLowerCase().includes(cityName)));
      if (requestedZone === undefined) {
        return 'City name could not be found';
      }
    }

    const userId = interaction.member.user.id;
    await Database.UpdateItem(userId, requestedZone.name);

    // If we're here, the city name was valid and we can go forward with writing the information
    return 'City name was valid! Functionality coming later';
  }
} as CommandDescription
