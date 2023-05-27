const S3Lite = require('s3lite');
const db = S3Lite.database(
  'https://squidbot.s3.us-east-2.amazonaws.com/squidbot.db',
  {
    s3Options: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  }
)

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Database2 {
  public static async Test (): Promise<string> {
    const data = await db.all('SELECT * FROM table');
    return data;
  }
}
