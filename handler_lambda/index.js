const aws = require('aws-sdk');
const nacl = require('tweetnacl');

exports.handler = async(event) => {
  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  const signature = event.headers['x-signature-ed25519'];
  const timestamp = event.headers['x-signature-timestamp'];
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
  
  const body = JSON.parse(strBody);
  
  console.log("Body Type: ", body.type);
  
  switch (body.type) {
	  case 1:
      return {
        statusCode: 200,
        body: JSON.stringify({ type: 1 })
      };
	  case 2:
      const lambdaParams = {
        FunctionName: 'SquidBot',
        InvocationType: 'Event',
        LogType: 'Tail',
        Payload: strBody,
      };

      const lambda = new aws.Lambda({ region: 'us-east-2' });
      lambda.invoke(lambdaParams, function(err, data) {
        console.log("Invoking SquidBot");
        if (err) {
          console.log(err, err.stack);
        } else {
          console.log("Lambda triggered!");
        }
      });;

      return {
        type: 5
      };
	  default:
      return {
        statusCode: 404
      }
  }
}
