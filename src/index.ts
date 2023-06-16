/* eslint-disable no-case-declarations */
import fs from 'fs';
import path from 'path';
import { Interaction } from './discord_api/interaction';
import { CommandDescription } from './discord_api/command';
import axios from 'axios';
import { StaticDeclarations } from './util/staticDeclarations';
import { CommandResult } from './discord_api/commandResult';

exports.handler = async (event: any) => {
  const strBody = event; // should be string, for successful sign

  // Creating static declarations
  StaticDeclarations.GenerateOptions();

  const commands: CommandDescription[] = [];

  // Load Commands
  const commandsPath = path.resolve(__dirname, 'commands/');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    try {
      const command: CommandDescription = require(`${commandsPath}/${file}`);
      commands.push(command);
    } catch (exception: any) {
      console.log(`Could not load command: ${file}`);
      console.log(exception);
    }
  }

  console.log('Commands loaded!');

  // Replying to ping (requirement 2.)
  const body: Interaction = JSON.parse(strBody);

  const chosenCommand = commands.find(c => c.data.name === body.data.name);

  if (chosenCommand != null) {
    const result = await chosenCommand.execute(body);
    console.log('Returning result:', result);
    await sendCommandResponse(body, result);
    return { statusCode: 200 };
  } else {
    return { statusCode: 404 };
  }
}

async function sendCommandResponse (interaction: Interaction, result: CommandResult): Promise<void> {
  const body: any = {};

  const message = (result.message !== undefined ? result.message : true);
  body.content = message;

  if (result.embeds !== undefined && result.embeds.length > 0) {
    body.embeds = result.embeds;
  }

  if (result.components !== undefined && result.components.length > 0) {
    body.components = result.components;
  }

  const util = require('util');
  console.log(util.inspect(body, { showHidden: true, depth: null, colors: false }));

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const res = await axios.patch(`https://discord.com/api/v10/webhooks/${process.env.APP_ID}/${interaction.token}/messages/@original`, body);
  console.log('Response from editing message: ', res);
}
