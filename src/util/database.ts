// const AWS = require('aws-sdk');

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Database {
  /*
  private static readonly ddb: DocumentClient = new AWS.DynamoDB.DocumentClient();

  public static async UpdateUserTimezone (userId: string, timezoneName: string): Promise<void> {
    const params: DocumentClient.UpdateItemInput = {
      TableName: 'SquidBot',
      Key: {
        squidBot: userId
      },
      UpdateExpression: 'set userTimeZone = :r',
      ExpressionAttributeValues: {
        ':r': timezoneName
      }
    };

    await this.UpdateItem(params);
  }

  public static async GetUserInformation (userIds: string[]): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/array-type
    const keyMap: { squidBot: string }[] = [];

    userIds.forEach(p => {
      keyMap.push({ squidBot: p });
    });

    const params: DocumentClient.BatchGetItemInput = {
      RequestItems: {
        SquidBot: {
          Keys: keyMap
        }
      }
    }

    return await this.BatchGet(params);
  }

  private static async UpdateItem (params: DocumentClient.UpdateItemInput): Promise<void> {
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

  private static async BatchGet (params: DocumentClient.BatchGetItemInput): Promise<any> {
    const result = await Database.ddb.batchGet(params).promise()
    if (result.$response.error != null) {
      console.log('Error - ', result.$response.error);
      return {};
    } else {
      return result.Responses;
    }
  }
  */
}
