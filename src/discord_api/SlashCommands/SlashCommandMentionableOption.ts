import { ApplicationCommandOptionBase } from './ApplicationCommandOptionBase';
import { ApplicationCommandOptionType } from './ApplicationCommandOptionType';

export class SlashCommandMentionableOption extends ApplicationCommandOptionBase {
    public readonly type = ApplicationCommandOptionType.Mentionable as const;
}
