import { DocumentClient } from 'aws-sdk/clients/dynamodb';
const AWS = require('aws-sdk');

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Database {
  private static readonly ddb: DocumentClient = new AWS.DynamoDB.DocumentClient();

  public static UpdateItem (primaryKey: string, sortKey: string): void {
    const params: DocumentClient.UpdateItemInput = {
      TableName: 'SquidBot',
      Key: {
        PRIMARY_KEY: primaryKey,
        SORT_KEY: sortKey
      }
    };

    try {
      const result = Database.ddb.update(params);
      console.log('Success - item added or updated', result);
    } catch (err) {
      console.log('Error', err);
    }
  }
}
