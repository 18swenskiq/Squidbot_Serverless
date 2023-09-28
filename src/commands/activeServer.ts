import { type CommandDescription } from '../discord_api/command'
import { CommandResult } from '../discord_api/commandResult';
import { InteractionData, type Interaction } from '../discord_api/interaction'
import { SlashCommandBuilder } from '../discord_api/slash_command_builder'
import { DatabaseWrapper } from '../util/databaseWrapper';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('active_rcon_server')
    .setDescription('Sets or gets the active ron server')
    .addStringOption(option => option
        .setName('server')
        .setDescription('The IP of the Game Server to set as active')
        .setRequired(false)),
  async execute (interaction: Interaction): Promise<CommandResult> {
    const servers = await DatabaseWrapper.GetGameServers(interaction.guild_id);

    if (!servers || servers.length === 0) {
        return new CommandResult("No servers registered for this guild! Use /add_game_server to add some!", false, false);
    }

    const chosenServerIp = (<InteractionData>interaction.data).options.find(o => o.name === 'server')?.value;

    // If the server input was provided
    if (chosenServerIp) 
    {
      const server = servers.find(s => s.ip === chosenServerIp);

      if (server) 
      {
        await DatabaseWrapper.SetActiveRconServer(interaction.member.user.id, interaction.guild_id, server.id);
      }
      else 
      {
        return new CommandResult('Input was not recognized as a registered RCON server for this guild.', true, false);
      }
    }
    else // The server input was not provided
    {
      const res = await DatabaseWrapper.GetActiveRconServer(interaction.member.user.id, interaction.guild_id);
      if (res?.ip) {
        return new CommandResult(`Current active server is \`${res.ip}:${res.port}\``, true, false);
      }
    }

    return new CommandResult('how did you make this appear', true, false);
  }
} as CommandDescription