import { GetObjectCommand, GetObjectRequest } from '@aws-sdk/client-s3';
import { StaticDeclarations } from '../../staticDeclarations';
import { BSON, EJSON, Document } from 'bson';
import { iDatabaseModel } from '../../../database_models/iDatabaseModel';
import { DatabaseQuery } from '../databaseQuery';

export class ModifyDatabaseObjectQueryBuilder<T extends iDatabaseModel> {
    private modify_obj = <T>{};
    private modify_obj_array_values: { [property: string]: string[] | number[] } = {};

    private remove_obj_array_values: { [property: string]: string[] | number[] } = {};

    private object_id: string;
    private throw_if_not_exists: boolean;

    constructor(object_id: string) {
        this.object_id = object_id;
        this.throw_if_not_exists = false;
    }

    public ThrowIfNotExists(): ModifyDatabaseObjectQueryBuilder<T> {
        this.throw_if_not_exists = true;
        return this;
    }

    public SetProperty<K extends keyof T>(property: K, value: T[K]): ModifyDatabaseObjectQueryBuilder<T> {
        this.modify_obj[property] = value;
        return this;
    }

    public SetPropertyIfValueNotUndefined<K extends keyof T>(
        property: K,
        value: T[K] | undefined
    ): ModifyDatabaseObjectQueryBuilder<T> {
        if (value !== undefined) {
            this.modify_obj[property] = value;
        }
        return this;
    }

    public AddToPropertyArray<K extends keyof T>(
        property: K,
        value: string[] | number[]
    ): ModifyDatabaseObjectQueryBuilder<T> {
        if (true) {
            let cool = <string>property;
            this.modify_obj_array_values[cool] = value;
            return this;
        } else {
        }
    }

    public RemoveFromPropertyArray<K extends keyof T>(
        property: K,
        value: string[] | number[]
    ): ModifyDatabaseObjectQueryBuilder<T> {
        if (true) {
            let cool = <string>property;
            this.remove_obj_array_values[cool] = value;
            return this;
        } else {
        }
    }

    public async Execute(type: { new (): T }): Promise<T> {
        // Get old or empty object if doesn't exist
        let obj = await this.GetNewOrExistingObject(type);

        // Modify object
        for (const key in this.modify_obj) {
            obj[key] = this.modify_obj[key];
        }

        // Append List stuff
        for (const key in this.modify_obj_array_values) {
            (obj[key as keyof T] as any) = (obj[key as keyof T] as Array<string | number>).concat(
                this.modify_obj_array_values[key]
            );
        }

        // Remove values where necessary
        for (const key in this.remove_obj_array_values) {
            for (const removal in this.remove_obj_array_values[key]) {
                const idx = (obj[key as keyof T] as Array<string | number>).indexOf(
                    this.remove_obj_array_values[key][removal]
                );
                if (idx < 0) {
                    throw new Error('Unexpected array index');
                }

                (obj[key as keyof T] as Array<string | number>).splice(idx, 1);
            }
        }

        // Set object
        await new DatabaseQuery().PutObject<T>(this.object_id, obj).Execute(type);
        return obj;
    }

    private async GetNewOrExistingObject(type: { new (): T }): Promise<T> {
        let model = await new DatabaseQuery().GetObject<T>(this.object_id).Execute(type);

        if (model == null) {
            if (this.throw_if_not_exists) {
                throw new Error('Attempted to modify an object that did not exist (THROW_IF_NOT_EXISTS === true)');
            }

            model = new type();
        }
        return model as T;
    }
}
