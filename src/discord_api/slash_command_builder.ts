import { ApplicationCommandOptionBase } from './SlashCommands/ApplicationCommandOptionBase';
import { SlashCommandRoleOption } from './SlashCommands/SlashCommanRoleOption';
import { SlashCommandAttachmentOption } from './SlashCommands/SlashCommandAttachmentOption';
import { SlashCommandBooleanOption } from './SlashCommands/SlashCommandBooleanOption';
import { SlashCommandChannelOption } from './SlashCommands/SlashCommandChannelOption';
import { SlashCommandMentionableOption } from './SlashCommands/SlashCommandMentionableOption';
import { SlashCommandStringOption } from './SlashCommands/SlashCommandStringOption';
import { SlashCommandUserOption } from './SlashCommands/SlashCommandUserOption';

export class SlashCommandBuilder {
  public readonly name: string = '';
  public readonly description: string = '';
  public readonly options: any[] = [];// ToAPIApplicationCommandOptions[] = [];
  public readonly default_permission: boolean | undefined = undefined;
  public readonly default_member_permissions: Permissions | null | undefined = undefined;
  public readonly dm_permission: boolean | undefined = undefined;
  public readonly nsfw: boolean | undefined = undefined;

  public setName (name: string): SlashCommandBuilder {
    // validateName(name);
    Reflect.set(this, 'name', name);
    return this;
  }

  public setDescription (description: string): SlashCommandBuilder {
    // validateDescription(description);
    Reflect.set(this, 'description', description);
    return this;
  }

  public setDefaultPermission (value: boolean): SlashCommandBuilder {
    // validateDefaultPermission(value);
    Reflect.set(this, 'default_permission', value);
    return this;
  }

  public setDefaultMemberPermissions (permissions: Permissions | bigint | number | null | undefined): SlashCommandBuilder {
    // const permissionValue = validateDefaultMemberPermissions(permissions);
    // Reflect.set(this, 'default_member_permissions', permissionValue);
    return this;
  }

  public setDMPermission (enabled: boolean | null | undefined): SlashCommandBuilder {
    // validateDMPermission(enabled);
    Reflect.set(this, 'dm_permission', enabled);
    return this;
  }

  public setNSFW (nsfw: boolean = true): SlashCommandBuilder {
    // validateNSFW(nsfw);
    Reflect.set(this, 'nsfw', nsfw);
    return this;
  }

  public addBooleanOption (
    input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)
  ): SlashCommandBuilder {
    return this._sharedAddOptionMethod(input, SlashCommandBooleanOption);
  }

  public addUserOption (input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)): SlashCommandBuilder {
    return this._sharedAddOptionMethod(input, SlashCommandUserOption);
  }

  public addChannelOption (
    input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)
  ): SlashCommandBuilder {
    return this._sharedAddOptionMethod(input, SlashCommandChannelOption);
  }

  public addRoleOption (input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): SlashCommandBuilder {
    return this._sharedAddOptionMethod(input, SlashCommandRoleOption);
  }

  public addAttachmentOption (
    input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)
  ): SlashCommandBuilder {
    return this._sharedAddOptionMethod(input, SlashCommandAttachmentOption);
  }

  public addMentionableOption (
    input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)
  ): SlashCommandBuilder {
    return this._sharedAddOptionMethod(input, SlashCommandMentionableOption);
  }

  public addStringOption (
    input:
    | Omit<SlashCommandStringOption, 'addchoices'>
    | Omit<SlashCommandStringOption, 'setAutocomplete'>
    | SlashCommandStringOption
    | ((
      builder: SlashCommandStringOption,
    ) =>
    | Omit<SlashCommandStringOption, 'addChoices'>
    | Omit<SlashCommandStringOption, 'setAutocomplete'>
    | SlashCommandStringOption)
  ): SlashCommandBuilder {
    return this._sharedAddOptionMethod(input, SlashCommandStringOption);
  }

  private _sharedAddOptionMethod<T extends ApplicationCommandOptionBase>(
    input:
    | Omit<T, 'addChoices'>
    | Omit<T, 'setAutocomplete'>
    | T
    | ((builder: T) => Omit<T, 'addChoices'> | Omit<T, 'setAutocomplete'> | T),
    Instance: new () => T
  ): SlashCommandBuilder {
    const { options } = this;

    // validateMaxOptionsLength(options);

    const result = typeof input === 'function' ? input(new Instance()) : input;

    // assertReturnOfBuilder(result, Instance);

    options.push(result);

    return this;
  }
}
