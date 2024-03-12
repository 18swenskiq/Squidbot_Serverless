import { GetObjectCommand, GetObjectRequest } from '@aws-sdk/client-s3';
import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { StaticDeclarations } from '../../staticDeclarations';

import { BSON, EJSON, Document } from 'bson';
import { DatabaseQuery } from '../databaseQuery';

export class GetDatabaseObjectQueryBuilder<T extends iDatabaseModel> {
    private object_id: string;
    private createIfNotExist: boolean;
    private modifyRoot: string;

    constructor(object_id: string) {
        this.object_id = object_id;
        this.createIfNotExist = false;
        this.modifyRoot = '';
    }

    public CreateIfNotExist(): GetDatabaseObjectQueryBuilder<T> {
        this.createIfNotExist = true;
        return this;
    }

    public ModifyRoot(newRoot: string): GetDatabaseObjectQueryBuilder<T> {
        this.modifyRoot = newRoot;
        return this;
    }

    public async Execute(type: { new (): T }): Promise<T | null> {
        // Get old or empty object if doesn't exist
        return await this.GetExistingObject(type);
    }

    private async GetExistingObject(type: { new (): T }): Promise<T | null> {
        const blank_obj = new type();
        const key = blank_obj.BuildKey(this.object_id, this.modifyRoot);

        const input: GetObjectRequest = {
            Bucket: 'squidbot',
            Key: key,
        };

        try {
            const command = new GetObjectCommand(input);
            const response = await StaticDeclarations.s3client.send(command);
            const respBytes = await response.Body?.transformToByteArray();

            if (respBytes === undefined) {
                throw new Error('Found object but it had no bytes :(');
            }

            const doc: Document = BSON.deserialize(respBytes);
            const obj = JSON.parse(EJSON.stringify(doc));

            const castedObj = obj as T;

            console.log('Casted object');
            console.log(castedObj);

            try {
                // Fix up all date objects
                for (const castKey in castedObj) {
                    console.log('Object key iteration');
                    if (typeof castedObj[castKey] === 'object') {
                        console.log('Found key of type object');
                        console.log(`Key: ${castKey}`);
                        if ('$date' in (castedObj[castKey] as any)) {
                            const dateStringVal = (castedObj[castKey] as any)['$date'];
                            const newDate = new Date(dateStringVal);
                            (castedObj[castKey] as any) = newDate;
                        }
                    }
                }

                console.log('post fixup object');
                console.log(castedObj);

                return castedObj;
            } catch (err: any) {
                console.log('Error when fixing up object');
                console.log(err);
                return castedObj;
            }
        } catch {
            if (this.createIfNotExist) {
                console.log(
                    `Object with key ${key} was not found in database for type ${typeof blank_obj}. It will be newly created.`
                );
                return await new DatabaseQuery()
                    .CreateNewObject<T>(key.replace(`${new type().GetTopLevelKey()}/`, '').replace('.bson', ''))
                    .Execute(type);
            }

            console.log(
                `Object with key ${key} was not found in database for type ${typeof blank_obj}. It will not be created`
            );
            return null;
        }
    }
}
