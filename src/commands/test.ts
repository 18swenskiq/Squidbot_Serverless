import { type CommandDescription } from '../discord_api/command'
import { type Interaction } from '../discord_api/interaction'
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('test description')
    .addStringOption(option => option
      .setName('userid')
      .setDescription('the user to set the timezone of')
      .setRequired(true))
    .addStringOption(option => option
      .setName('timezone')
      .setDescription('the timezone string')
      .setRequired(true)),
  async execute (interaction: Interaction): Promise<string> {
    const userId = interaction.data.options[0].value;
    const strfd = interaction.data.options[1].value;

    console.log('Launching database wrapper');
    await DatabaseWrapper.SetUserTimeString(userId, strfd);

    return 'set';
  }
} as CommandDescription
