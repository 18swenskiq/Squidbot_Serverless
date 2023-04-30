import { CommandDescription } from "../discord_api/command";
import { Interaction } from "../discord_api/interaction";
import { SlashCommandBuilder } from "../discord_api/slash_command_builder";

module.exports = <CommandDescription>{
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test description'),
    execute(interaction: Interaction): string {
        return 'you successfully tested this function';
    }
}