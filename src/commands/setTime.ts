import { CommandDescription } from "../discord_api/command";
import { Interaction } from "../discord_api/interaction";
import { SlashCommandBuilder } from "../discord_api/slash_command_builder";

module.exports = <CommandDescription><unknown>{
    data: new SlashCommandBuilder()
        .setName('set_time')
        .setDescription('Sets your time zone, to be used with the /times command')
        .addStringOption(option => option
            .setName('should_this_work')
            .setDescription('booo')
            .addChoices([
                {
                    name: 'squingman',
                    value: 'testy'
                },
                {
                    name: 'yo_momma_balls',
                    value: 'deez_nuts'
                }
            ])),
    execute(interaction: Interaction): string {
        return 'you successfully tested this function';
    }
}