import fs from 'fs';
import { S3 } from 'aws-sdk';
import axios from 'axios';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

const AWS = require('aws-sdk');
const s3: S3 = new AWS.S3();
const localDBPath = '/tmp/squidbot_db.db';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class DatabaseWrapper {
  public static async PassRawSql (sql: string): Promise<string> {
    const db = await DatabaseWrapper.LoadDatabase();
    let databaseResult: any;
    await db.all(sql, (err: any, rows: any) => {
      if (err != null) {
        console.log('uh oh, error!', err);
      } else {
        databaseResult = rows;
      }
    });

    await db.close();
    // TODO: push DB again
    return databaseResult;
  }

  private static async LoadDatabase (): Promise<Database> {
    const params = {
      Bucket: 'squidbot',
      Expires: 3000,
      Key: 'squidbot.db'
    }

    const url = await s3.getSignedUrlPromise('getObject', params).catch((err) => { console.log(err) });

    const res = await axios.get(url as string, {
      responseType: 'stream'
    });

    const iStream = res.data;
    const oStream = fs.createWriteStream(localDBPath);
    iStream.pipe(oStream);

    return await open({
      filename: localDBPath,
      driver: sqlite3.Database
    })
  }
}
