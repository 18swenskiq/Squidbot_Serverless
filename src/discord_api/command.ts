import { CommandResult } from './commandResult';
import { Interaction } from './interaction';
import { SlashCommandBuilder } from './slash_command_builder';

export interface CommandDescription {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction) => Promise<CommandResult>;
}
