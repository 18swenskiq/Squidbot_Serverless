import { ApplicationCommandOptionType } from './ApplicationCommandOptionType';

export abstract class ApplicationCommandOptionBase {
    public abstract readonly type: ApplicationCommandOptionType;
    public readonly required: boolean = false;
    public readonly name: string = '';
    public readonly description: string = '';

    // This does not have any setters, as we will enforce it as false everywhere except for strings, where it can be changed
    public readonly autocomplete: boolean = false;

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    public setRequired(required: boolean) {
        // validateRequired(required);
        Reflect.set(this, 'required', required);
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    public setName(name: string) {
        Reflect.set(this, 'name', name);
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    public setDescription(description: string) {
        Reflect.set(this, 'description', description);
        return this;
    }
}
