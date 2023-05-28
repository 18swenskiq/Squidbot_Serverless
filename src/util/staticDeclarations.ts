import { S3Client } from '@aws-sdk/client-s3';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class StaticDeclarations {
  public static s3client: S3Client;

  public static GenerateOptions (): void {
    StaticDeclarations.s3client = new S3Client({ region: 'us-east-2' });
  }
}
