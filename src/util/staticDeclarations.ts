import { S3Client } from '@aws-sdk/client-s3';
import { CS2PUGGameMode } from '../enums/CS2PUGGameMode';

export abstract class StaticDeclarations {
    public static s3client: S3Client;

    private static wingmanCollectionId = '2747675401';
    private static threesomeCollectionId = '2752973478';
    private static classicCollectionId = '2753947063';

    public static CollectionIdForGamemode(gameMode: CS2PUGGameMode): string {
        switch (gameMode) {
            case CS2PUGGameMode.arena:
            case CS2PUGGameMode.wingman:
                return this.wingmanCollectionId;
            case CS2PUGGameMode.threesome:
                return this.threesomeCollectionId;
            case CS2PUGGameMode.classic:
                return this.classicCollectionId;
            default:
                throw Error('Unexpected gamemode');
        }
    }

    public static GenerateOptions(): void {
        StaticDeclarations.s3client = new S3Client({ region: 'us-east-2' });
    }
}
