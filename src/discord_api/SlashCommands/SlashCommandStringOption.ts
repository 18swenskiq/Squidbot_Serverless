import { ApplicationCommandOptionBase } from "./ApplicationCommandOptionBase";
import { ApplicationCommandOptionType } from "./ApplicationCommandOptionType";

export class SlashCommandStringOption extends ApplicationCommandOptionBase {
	public readonly type = ApplicationCommandOptionType.String as const;
	public readonly max_length?: number;
	public readonly min_length?: number;

	public setMaxLength(max: number): this {
		//maxLengthValidator.parse(max);

		Reflect.set(this, 'max_length', max);

		return this;
	}

	public setMinLength(min: number): this {
		//minLengthValidator.parse(min);

		Reflect.set(this, 'min_length', min);

		return this;
	}
}