import { ApplicationCommandOptionBase } from './ApplicationCommandOptionBase';
import { ApplicationCommandOptionType } from './ApplicationCommandOptionType';

export class SlashCommandRoleOption extends ApplicationCommandOptionBase {
  public override readonly type = ApplicationCommandOptionType.Role as const;
}
