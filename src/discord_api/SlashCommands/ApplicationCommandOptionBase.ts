import { ApplicationCommandOptionType } from "./ApplicationCommandOptionType";

export abstract class ApplicationCommandOptionBase {
    public abstract readonly type: ApplicationCommandOptionType;
    public readonly required: boolean = false;
    public readonly name: string = '';
    public readonly description: string = '';

    public setRequired(required: boolean) {
        //validateRequired(required);
        Reflect.set(this, 'required', required);
        return this;
    }

    public setName(name: string) {
        Reflect.set(this, 'name', name);
        return this;
    }

    public setDescription(description: string) {
        Reflect.set(this, 'description', description);
        return this;
    }
}