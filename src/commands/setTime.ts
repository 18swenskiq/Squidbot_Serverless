import { CommandDescription } from "../discord_api/command";
import { Interaction } from "../discord_api/interaction";
import { SlashCommandBuilder } from "../discord_api/slash_command_builder";

module.exports = <CommandDescription><unknown>{
    data: new SlashCommandBuilder()
        .setName('setTime')
        .setDescription('Sets your time zone, to be used with the /times command')
        .addStringOption(option => option
            .setName('input')
            .setDescription('The input to echo back')
            .setRequired(true))
        .addStringOption(option => option
            .setName('secondInput')
            .setDescription('The second input')
            .setRequired(true)),
    execute(interaction: Interaction): string {
        return 'you successfully tested this function';
    }
}