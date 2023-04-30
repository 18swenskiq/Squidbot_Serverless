import { SlashCommandBuilder } from "./slash_command_builder";

export interface CommandDescription {
    data: SlashCommandBuilder;
    execute: Function;
}