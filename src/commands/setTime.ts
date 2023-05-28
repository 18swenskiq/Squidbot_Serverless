import { getTimeZones } from '@vvo/tzdb';
import { CommandDescription } from '../discord_api/command';
import { Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_time')
    .setDescription('Sets your time zone, to be used with the /times command')
    .addStringOption(option => option
      .setName('city')
      .setDescription('A city that you are in the time zone of. Try to select the biggest city you share a timezone with.')
      .setRequired(true)),
  async execute (interaction: Interaction): Promise<string> {
    console.log('Setting time');
    const cityName = interaction.data.options[0].value.toLowerCase().replace(' ', '_');
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
    // await Database.UpdateUserTimezone(userId, requestedZone.name);
    console.log('Launching database wrapper');
    await DatabaseWrapper.SetUserTimeString(userId, requestedZone.name);

    // If we're here, the city name was valid and we can go forward with writing the information
    const currentOffset = requestedZone.currentTimeOffsetInMinutes;

    const now = new Date();
    const resultTz = new Date(now);
    resultTz.setMinutes(now.getMinutes() + currentOffset);
    return `Timezone set to ${requestedZone.name}! (${resultTz.getUTCHours()}:${resultTz.getUTCMinutes()})`;
  }
} as CommandDescription
