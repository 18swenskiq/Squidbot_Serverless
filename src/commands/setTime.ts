import { CommandDescription } from "../discord_api/command";
import { Interaction } from "../discord_api/interaction";
import { SlashCommandBuilder } from "../discord_api/slash_command_builder";

module.exports = <CommandDescription><unknown>{
    data: new SlashCommandBuilder()
        .setName('setTime')
        .setDescription('Sets your time zone, to be used with the /times command')
        .addBooleanOption(option => option
            .setName('shouldThisWork')
            .setDescription('booo')),
    execute(interaction: Interaction): string {
        return 'you successfully tested this function';
    }
}