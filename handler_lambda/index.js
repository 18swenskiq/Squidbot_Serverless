const aws = require("aws-sdk");
const nacl = require("tweetnacl");

exports.handler = async (event) => {
  const strBody = event.body; // should be string, for successful sign
  const body = typeof strBody === "string" ? JSON.parse(strBody) : strBody;

  console.log("RUNNING IT WITH THIS BODY");
  console.log(body);

  const testing = "testing" in body;

  if (!testing) {
    const PUBLIC_KEY = process.env.PUBLIC_KEY;
    const signature = event.headers["x-signature-ed25519"];
    const timestamp = event.headers["x-signature-timestamp"];

    if (PUBLIC_KEY === undefined) {
      throw new Error("Public key was undefined!");
    }

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + strBody),
      Buffer.from(signature, "hex"),
      Buffer.from(PUBLIC_KEY, "hex")
    );

    if (!isVerified) {
      return {
        statusCode: 401,
        body: JSON.stringify("invalid request signature"),
      };
    }
  }

  console.log("Body Type: ", body.type);

  switch (body.type) {
    case 1:
      return {
        statusCode: 200,
        body: JSON.stringify({ type: 1 }),
      };
    case 2:
    case 3:
      if (testing) {
        console.log(
          "Attempted to flow into Lambda during testing, this is an invalid case. Quitting."
        );
        return {
          statusCode: 401,
        };
      }

      const lambdaParams = {
        FunctionName: process.env.EXECUTE_LAMBDA_NAME,
        InvocationType: "Event",
        LogType: "Tail",
        Payload: JSON.stringify(strBody),
      };

      const lambda = new aws.Lambda({ region: "us-east-2" });
      const reuslt = await lambda.invoke(lambdaParams).promise();

      console.log(reuslt);

      if (body.type === 2) {
        return { type: 5 };
      }
      return { type: 5, data: { flags: 64 } };
    case 4:
      const autocompletelambdaParams = {
        FunctionName: process.env.EXECUTE_LAMBDA_NAME,
        InvocationType: "RequestResponse",
        LogType: "Tail",
        Payload: JSON.stringify(strBody),
      };

      const autocompleteLambda = new aws.Lambda({ region: "us-east-2" });
      const autocompleteResult = await autocompleteLambda
        .invoke(autocompletelambdaParams)
        .promise();

      console.log("Autocomplete result:");
      console.log(autocompleteResult);
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: 4,
          data: { choices: autocompleteResult.data },
        }),
      };
    case 1000:
      // testing
      return { statusCode: 200 };
    default:
      return {
        statusCode: 404,
      };
  }
};
