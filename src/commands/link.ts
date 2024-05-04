import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';
import { SteamApi } from '../steam_api/steamApi';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your discord account to Steam! (This is required for pugging)')
        .addStringOption((option) =>
            option
                .setName('steam_id')
                .setDescription('Your SteamID64. This can be found somewhere like steamidfinder.com')
                .setRequired(true)
        ),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const interactionData = <InteractionData>interaction.data;
        const steamId64 = interactionData.options.find((o) => o.name === 'steam_id')?.value;

        if (!steamId64) {
            return new CommandResult('Did not pass in a valid steamid64', false, false);
        }

        // Validate that the input is a proper steam id
        const steamPlayerSummary = await SteamApi.GetSteamUserSummary(steamId64);
        if (!steamPlayerSummary) {
            return new CommandResult('Unable to find steam account. Please try again', false, false);
        }

        /*
        // Ensure that id isn't already being used by somebody else
        const existingLinks = await new DatabaseQuery()
            .GetObjects<DB_UserSettings>()
            .WherePropertyEquals('steamLink', steamId64)
            .Execute(DB_UserSettings);

        if (!existingLinks || existingLinks.length > 0) {
            return new CommandResult('Steam id provided is already linked to another user', false, false);
        }

        // Add to db
        await new DatabaseQuery()
            .ModifyObject<DB_UserSettings>(interaction.member.user.id)
            .SetProperty('steamLink', steamId64)
            .Execute(DB_UserSettings);

            */
        return new CommandResult('Updated SteamID link', false, false);
    },
} as CommandDescription;
