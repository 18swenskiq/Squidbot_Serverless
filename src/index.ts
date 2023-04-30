import nacl from 'tweetnacl';
import fs from 'fs';
import path from 'path';
import { Interaction, InteractionType } from "./discord_api/interaction";
import { CommandDescription } from './discord_api/command';

exports.handler = async (event: { headers: { [x: string]: any; }; body: string; }) => {
  // Checking signature (requirement 1.)
  // Your public key can be found on your application in the Developer Portal
  console.log(event);
  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  const signature = event.headers['x-signature-ed25519']
  const timestamp = event.headers['x-signature-timestamp'];
  const strBody = event.body; // should be string, for successful sign

  if (PUBLIC_KEY === undefined)
  {
    throw new Error("Public key was undefined!");
  }

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return {
      statusCode: 401,
      body: JSON.stringify('invalid request signature'),
    };
  }

  console.log("Loading commands");
  let commands: CommandDescription[] = [];
  try {
    // Load Commands
    const commandsPath = path.resolve(__dirname, "commands/");
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    console.log(`Loading ${commandFiles.length} commands...`);
    for (const file of commandFiles) {
      const command: CommandDescription = require(`${commandsPath}/${file}`);
      commands.push(command);
    }
  }
  catch (exception: any) {
    console.log("Could not load commands because of this");
    console.log(exception.message);
  }

  registerCommands(commands);

  // Replying to ping (requirement 2.)
  const body: Interaction = JSON.parse(strBody);
  console.log(`Body name: ${body.data.name}`);
  
  switch(body.type)
  {
    case InteractionType.PING:
      return {
        statusCode: 200,
        body: JSON.stringify({ "type": 1}),
      };
    case InteractionType.APPLICATION_COMMAND:
      let chosenCommand = commands.find(c => c.data.name === body.data.name);

      if (chosenCommand) {
        let result = chosenCommand.execute();
        return JSON.stringify({ "type": 4, "data": { "content": result }});
      }
      
      //if (body.data.name == 'foo') {
      //  return JSON.stringify({ "type": 4, "data": { "content": "bar" }});
      //}
    default:
      console.log("returning 404 from unexpected body. Body is as follows:");
	    console.log(body);
      return {
        statusCode: 404  // If no handler implemented for Discord's request
      }
  }
};

function registerCommands(commands: CommandDescription[]) {
  // Register Commands
  const axios = require('axios').default;
  let url = `https://discord.com/api/v8/applications/${process.env.APP_ID}/guilds/${process.env.GUILD_ID}/commands`;

  const commandHeaders = {
    "Authorization": `Bot ${process.env.BOT_TOKEN}`,
    "Content-Type": "application/json"
  }

  for (const com of commands) {
    let command_data = {
      "name": com.data.name,
      "type": 1,
      "description": com.data.description,
    }

    axios.post(url, JSON.stringify(command_data), {
      headers: commandHeaders,
    });
  }
}