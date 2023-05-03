import { DocumentClient } from 'aws-sdk/clients/dynamodb';
const AWS = require('aws-sdk');

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Database {
  private static readonly ddb: DocumentClient = new AWS.DynamoDB.DocumentClient();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public static async UpdateItem (primaryKey: string, sortKey: string): Promise<void> {
    const params: DocumentClient.UpdateItemInput = {
      TableName: 'SquidBot',
      Key: {
        squidBot: primaryKey
      },
      UpdateExpression: 'set userTimeZone = :r',
      ExpressionAttributeValues: {
        ':r': sortKey
      }
    };

    await Database.ddb.update(params).promise().then(
      p => {
        if (p.$response.error != null) {
          console.log('Error - ', p.$response.error);
        } else {
          console.log('Success - ', p.$response.data)
        }
      }
    );
  }

  public static async BatchGet (primaryKeys: string[]): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/array-type
    const keyMap: { squidBot: { S: string; } }[] = [];

    primaryKeys.forEach(p => {
      keyMap.push({ squidBot: { S: p } });
    });

    console.log('the key map:', keyMap);

    const params: DocumentClient.BatchGetItemInput = {
      RequestItems: {
        SquidBot: {
          Keys: keyMap
        }
      }
    }

    await Database.ddb.batchGet(params).promise().then(
      p => {
        if (p.$response.error != null) {
          console.log('Error - ', p.$response.error);
          return {};
        } else {
          console.log('Success - ', p.$response.data);
          return p;
        }
      }
    );
  }
}
