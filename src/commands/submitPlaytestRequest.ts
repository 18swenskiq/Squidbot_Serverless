import { text } from 'stream/consumers';
import { type CommandDescription } from '../discord_api/command';
import { CommandResult } from '../discord_api/commandResult';
import { type Interaction } from '../discord_api/interaction';
import { TextInputComponent } from '../discord_api/messageComponent';
import { GuildPermissions } from '../discord_api/permissions';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit_playtest_request')
        .setDescription('Submits a playtest request')
        .setDefaultMemberPermissions([GuildPermissions.MANAGE_CHANNELS]),
    async execute(interaction: Interaction): Promise<CommandResult> {
        const cr = new CommandResult('I have no idea what this is gonna look like', false, true);

        const textInput1 = new TextInputComponent(
            'custom_id_1_test',
            1,
            'Cool Input',
            1,
            300,
            true,
            '',
            'Placeholder Text'
        );

        const componentWrapper: any = { type: 1, components: [] };
        componentWrapper.components.push(textInput1);

        cr.components = [];
        cr.components.push(componentWrapper);

        return cr;
    },
} as CommandDescription;
