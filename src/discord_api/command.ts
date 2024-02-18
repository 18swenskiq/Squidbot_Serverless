import { CommandResult } from './commandResult';
import { Interaction, InteractionDataOptions } from './interaction';
import { SlashCommandBuilder } from './slash_command_builder';

export interface CommandDescription {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction) => Promise<CommandResult>;
    autocomplete: (interaction: Interaction) => Promise<InteractionDataOptions[] | null>;
}
