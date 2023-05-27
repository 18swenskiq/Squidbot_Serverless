/* eslint-disable no-case-declarations */
import fs from 'fs';
import path from 'path';
import { Interaction } from './discord_api/interaction';
import { CommandDescription } from './discord_api/command';
import axios from 'axios';

exports.handler = async (event: any) => {
  console.log(event);
  const strBody = event; // should be string, for successful sign

  console.log('checking directory for things');
  const pebis = _getAllFilesFromFolder('/var/task/node_modules/sqlite3')
  console.log(pebis);

  console.log('Loading commands');
  const commands: CommandDescription[] = [];

  // Load Commands
  const commandsPath = path.resolve(__dirname, 'commands/');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  console.log(`Loading ${commandFiles.length} commands...`);
  for (const file of commandFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    console.log('Loading Command:', file);
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
  console.log(`Body name: ${body.data.name}`);

  const chosenCommand = commands.find(c => c.data.name === body.data.name);

  if (chosenCommand != null) {
    const result = await chosenCommand.execute(body);
    console.log('Returning result:', result);
    // return JSON.stringify({ type: 4, data: { content: result } });
    await sendCommandResponse(body, result);
    return { statusCode: 200 };
  } else {
    return { statusCode: 404 };
  }
}

async function sendCommandResponse (interaction: Interaction, message: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const res = await axios.patch(`https://discord.com/api/v10/webhooks/${process.env.APP_ID}/${interaction.token}/messages/@original`, {
    content: message
  });
  console.log('Response from editing message: ', res);
}

const _getAllFilesFromFolder = function (dir: string): any {
  let results: any[] = [];

  fs.readdirSync(dir).forEach(function (file: string) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);

    if (stat.isDirectory()) {
      results = results.concat(_getAllFilesFromFolder(file))
    } else results.push(file);
  });

  return results;
};
