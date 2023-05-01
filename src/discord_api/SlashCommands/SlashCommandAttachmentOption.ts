import { ApplicationCommandOptionBase } from './ApplicationCommandOptionBase';
import { ApplicationCommandOptionType } from './ApplicationCommandOptionType';

export class SlashCommandAttachmentOption extends ApplicationCommandOptionBase {
  public override readonly type = ApplicationCommandOptionType.Attachment as const;
}
