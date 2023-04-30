import { ApplicationCommandOptionBase } from "./SlashCommands/ApplicationCommandOptionBase";
import { SlashCommandRoleOption } from "./SlashCommands/SlashCommanRoleOption";
import { SlashCommandAttachmentOption } from "./SlashCommands/SlashCommandAttachmentOption";
import { SlashCommandBooleanOption } from "./SlashCommands/SlashCommandBooleanOption";
import { SlashCommandChannelOption } from "./SlashCommands/SlashCommandChannelOption";
import { SlashCommandMentionableOption } from "./SlashCommands/SlashCommandMentionableOption";
import { SlashCommandStringOption } from "./SlashCommands/SlashCommandStringOption";
import { SlashCommandUserOption } from "./SlashCommands/SlashCommandUserOption";

export class SlashCommandBuilder {
    public readonly name: string = undefined!;
    public readonly description: string = undefined!;
    public readonly options: any[] = [];// ToAPIApplicationCommandOptions[] = [];
    public readonly default_permission: boolean | undefined = undefined;
    public readonly default_member_permissions: Permissions | null | undefined = undefined;
    public readonly dm_permission: boolean | undefined = undefined;
    public readonly nsfw: boolean | undefined = undefined;

    public setName(name: string): SlashCommandBuilder {
        //validateName(name);
        Reflect.set(this, 'name', name);
        return this;
    }

    public setDescription(description: string) {
		//validateDescription(description);
		Reflect.set(this, 'description', description);
		return this;
	}

    public setDefaultPermission(value: boolean): SlashCommandBuilder {
        //validateDefaultPermission(value);
        Reflect.set(this, 'default_permission', value);
        return this;
    }

    public setDefaultMemberPermissions(permissions: Permissions | bigint | number | null | undefined) {
        //const permissionValue = validateDefaultMemberPermissions(permissions);
        //Reflect.set(this, 'default_member_permissions', permissionValue);
        return this;
    }

    public setDMPermission(enabled: boolean | null | undefined) {
        //validateDMPermission(enabled);
        Reflect.set(this, 'dm_permission', enabled);
        return this;
    }

    public setNSFW(nsfw: boolean = true) {
        //validateNSFW(nsfw);
        Reflect.set(this, 'nsfw', nsfw);
        return this;
    }

    public addBooleanOption(
        input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption),
    ) {
        return this._sharedAddOptionMethod(input, SlashCommandBooleanOption);
    }

    public addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)) {
        return this._sharedAddOptionMethod(input, SlashCommandUserOption);
    }

    public addChannelOption(
        input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption),
    ) {
        return this._sharedAddOptionMethod(input, SlashCommandChannelOption);
    }

    public addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)) {
        return this._sharedAddOptionMethod(input, SlashCommandRoleOption);
    }

    public addAttachmentOption(
        input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption),
    ) {
        return this._sharedAddOptionMethod(input, SlashCommandAttachmentOption);
    }

    public addMentionableOption(
        input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption),
    ) {
        return this._sharedAddOptionMethod(input, SlashCommandMentionableOption);
    }

    public addStringOption(
        input:
            | Omit<SlashCommandStringOption, 'addchoices'>
            | Omit<SlashCommandStringOption, 'setAutocomplete'>
            | SlashCommandStringOption
            | ((
                    builder: SlashCommandStringOption,
                ) =>
                    | Omit<SlashCommandStringOption, 'addChoices'>
                    | Omit<SlashCommandStringOption, 'setAutocomplete'>
                    | SlashCommandStringOption),
                    
    ) {
        return this._sharedAddOptionMethod(input, SlashCommandStringOption);
    }

    /*
    public addSubcommandGroup(
        input:
            | SlashCommandSubcommandGroupBuilder
            | ((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashcommandSubcommandGroupBuilder),
    ): SlashcommandSubcommandsOnlybuilder {
        const { options } = this;
        validateMaxOptionsLength(options);

        const result = typeof input === 'function' ? input(new SlashCommandSubcommandGroupBuilder()) : input;

        assertReturnOfBuilder(result, SlashCommandSubcommandGroupBuilder);
        options.push(result);
        return this;
    }

    public addSubcommand(
		input:
			| SlashCommandSubcommandBuilder
			| ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder),
	): SlashCommandSubcommandsOnlyBuilder {
		const { options } = this;

		validateMaxOptionsLength(options);

		const result = typeof input === 'function' ? input(new SlashCommandSubcommandBuilder()) : input;

		assertReturnOfBuilder(result, SlashCommandSubcommandBuilder);

		// Push it
		options.push(result);

		return this;
	}
    */

    private _sharedAddOptionMethod<T extends ApplicationCommandOptionBase>(
        input:
            | Omit<T, 'addChoices'>
            | Omit<T, 'setAutocomplete'>
            | T
            | ((builder: T) => Omit<T, 'addChoices'> | Omit<T, 'setAutocomplete'> | T),
        Instance: new () => T,
    ): true extends true ? Omit<this, 'addSubcommand' | 'addSubcommandGroup'> : this {
        const { options } = this;

        //validateMaxOptionsLength(options);

        const result = typeof input === 'function' ? input(new Instance()) : input;

        //assertReturnOfBuilder(result, Instance);

        options.push(result);

        return this;
    }
}