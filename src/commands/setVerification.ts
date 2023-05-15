import { CommandDescription } from '../discord_api/command';
import { Interaction } from '../discord_api/interaction';
import { SlashCommandBuilder } from '../discord_api/slash_command_builder';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_verification')
    .setDescription('Sets the verification channel that will be used, and enables verification')
    .addChannelOption(option => option
      .setName('channel')
      .setDescription('The channel to be used for verification')
      .setRequired(true))
    .addRoleOption(option => option
      .setName('role')
      .setDescription('The role to be given out after verification is complete')
      .setRequired(true)),
  async execute (interaction: Interaction): Promise<string> {
    return 'cool!';
  }
} as CommandDescription
