import nacl from 'tweetnacl';
import { Interaction, InteractionType } from "./discord_api/interaction";

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
      if (body.data.name == 'foo') {
        return JSON.stringify({ "type": 4, "data": { "content": "bar" }});
      }
    default:
      console.log("returning 404 from unexpected body. Body is as follows:");
	    console.log(body);
      return {
        statusCode: 404  // If no handler implemented for Discord's request
      }
  }
};