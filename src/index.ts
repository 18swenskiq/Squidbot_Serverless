/* eslint-disable no-case-declarations */
import nacl from 'tweetnacl';
import fs from 'fs';
import path from 'path';
import { Interaction, InteractionType } from './discord_api/interaction';
import { CommandDescription } from './discord_api/command';
import axios from 'axios';

exports.handler = async (event: { headers: Record<string, any>; body: string; }) => {
  // Checking signature (requirement 1.)
  // Your public key can be found on your application in the Developer Portal
  console.log(event);
  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  const signature: string = event.headers['x-signature-ed25519']
  const timestamp: string = event.headers['x-signature-timestamp'];
  const strBody = event.body; // should be string, for successful sign

  if (PUBLIC_KEY === undefined) {
    throw new Error('Public key was undefined!');
  }

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return {
      statusCode: 401,
      body: JSON.stringify('invalid request signature')
    };
  }

  console.log('Loading commands');
  const commands: CommandDescription[] = [];

  // Load Commands
  const commandsPath = path.resolve(__dirname, 'commands/');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  console.log(`Loading ${commandFiles.length} commands...`);
  for (const file of commandFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command: CommandDescription = require(`${commandsPath}/${file}`);
    commands.push(command);
  }

  // Replying to ping (requirement 2.)
  const body: Interaction = JSON.parse(strBody);
  console.log(`Body name: ${body.data.name}`);

  switch (body.type) {
    case InteractionType.PING:
      return {
        statusCode: 200,
        body: JSON.stringify({ type: 1 })
      };
    case InteractionType.APPLICATION_COMMAND:
      // We need to defer the reply as this could take a bit of time
      const newInteraction = await createDeferral(body);

      const chosenCommand = commands.find(c => c.data.name === body.data.name);

      if (chosenCommand != null) {
        const result = await chosenCommand.execute(newInteraction);
        console.log('Returning result:', result);
        // return JSON.stringify({ type: 4, data: { content: result } });
        await sendCommandResponse(newInteraction, result);
        return { statusCode: 200 };
      }

      break;

    default:
      console.log('returning 404 from unexpected body. Body is as follows:');
      console.log(body);
      return {
        statusCode: 404 // If no handler implemented for Discord's request
      }
  }
};

async function createDeferral (originalInteraction: Interaction): Promise<Interaction> {
  const res = await axios.post(`https://discord.com/api/v10/interactions/${originalInteraction.id}/${originalInteraction.token}/callback`, {
    type: 6
  });
  console.log('Response from post: ', res);
  return res.data;
}

async function sendCommandResponse (interaction: Interaction, message: string): Promise<void> {
  const res = await axios.post(`https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`, {
    type: 4,
    data: {
      content: message
    }
  });
  console.log('Response from final send: ', res);
}
