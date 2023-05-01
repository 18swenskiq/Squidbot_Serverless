import { ApplicationCommandOptionBase } from './ApplicationCommandOptionBase';
import { ApplicationCommandOptionType } from './ApplicationCommandOptionType';

export class SlashCommandBooleanOption extends ApplicationCommandOptionBase {
  public readonly type = ApplicationCommandOptionType.Boolean as const;
}
