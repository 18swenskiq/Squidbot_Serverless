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

    public toJSON(): any {//RESTPostAPIChatInputApplicationCommandsJSONBody {
		//validateRequiredParameters(this.name, this.description, this.options);

		//validateLocalizationMap(this.name_localizations);
		//validateLocalizationMap(this.description_localizations);

		return {
			...this,
			options: this.options.map((option) => option.toJSON()),
		};
	}
}