import { getTimeZones } from '@vvo/tzdb';
import { CommandDescription } from '../discord_api/command';
import { Interaction, InteractionData } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { DatabaseWrapper } from '../util/databaseWrapper';
import { CommandResult } from '../discord_api/commandResult';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_time')
        .setDescription('Sets your time zone, to be used with the /times command')
        .addStringOption((option) =>
            option
                .setName('city')
                .setDescription(
                    'A city that you are in the time zone of. Try to select the biggest city you share a timezone with.'
                )
                .setRequired(true)
        ),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        const cityName = interactionData.options[0].value.toLowerCase().replace(' ', '_');
        const zones = getTimeZones({ includeUtc: true });

        let requestedZone = zones.find((z) => z.mainCities.some((c) => c.toLowerCase() === cityName));

        if (requestedZone === undefined) {
            // If it wasn't in the main cities, let's try searching the name directly
            requestedZone = zones.find((z) => z.group.some((c) => c.toLowerCase().includes(cityName)));
            if (requestedZone === undefined) {
                return new CommandResult('City name could not be found', true, false);
            }
        }

        const userId = interaction.member.user.id;

        /*
        await new DatabaseQuery()
            .ModifyObject<DB_UserSettings>(userId)
            .SetProperty('timeZoneName', requestedZone.name)
            .Execute(DB_UserSettings);

            */
        // If we're here, the city name was valid and we can go forward with writing the information
        const currentOffset = requestedZone.currentTimeOffsetInMinutes;

        const now = new Date();
        const resultTz = new Date(now);
        resultTz.setMinutes(now.getMinutes() + currentOffset);
        return new CommandResult(
            `Timezone set to ${requestedZone.name}! (${resultTz.getUTCHours()}:${resultTz.getUTCMinutes()})`,
            false,
            false
        );
    },
} as CommandDescription;
