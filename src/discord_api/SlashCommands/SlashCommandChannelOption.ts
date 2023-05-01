import { ApplicationCommandOptionBase } from './ApplicationCommandOptionBase';
import { ApplicationCommandOptionType } from './ApplicationCommandOptionType';

export class SlashCommandChannelOption extends ApplicationCommandOptionBase {
  public override readonly type = ApplicationCommandOptionType.Channel as const;
}
