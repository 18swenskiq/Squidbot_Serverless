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

  public static async BatchQuery (primaryKeys: string[]): Promise<any> {
    const keyMap: Array<{ squidBot: { N: string; }; }> = [];

    primaryKeys.forEach(p => {
      keyMap.push({ squidBot: { N: p } });
    })

    const params: DocumentClient.QueryInput = {
      TableName: 'SquidBot',
      FilterExpression: 'squidBot IN (:val)',
      ExpressionAttributeValues: {
        ':val': primaryKeys
      }
    }
    await Database.ddb.query(params).promise().then(
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
