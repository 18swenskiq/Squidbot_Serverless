import { ApplicationCommandOptionBase } from './ApplicationCommandOptionBase';
import { ApplicationCommandOptionType } from './ApplicationCommandOptionType';

export class SlashCommandUserOption extends ApplicationCommandOptionBase {
    public readonly type = ApplicationCommandOptionType.User as const;
}
