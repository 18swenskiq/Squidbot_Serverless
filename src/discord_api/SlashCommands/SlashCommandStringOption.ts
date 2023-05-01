import { Choice } from '../choice';
import { ApplicationCommandOptionBase } from './ApplicationCommandOptionBase';
import { ApplicationCommandOptionType } from './ApplicationCommandOptionType';

export class SlashCommandStringOption extends ApplicationCommandOptionBase {
  public readonly type = ApplicationCommandOptionType.String as const;
  public readonly choices?: Choice[];
  public readonly max_length?: number;
  public readonly min_length?: number;

  public addChoices (choices: Choice[]): SlashCommandStringOption {
    Reflect.set(this, 'choices', choices);
    return this;
  }

  public setMaxLength (max: number): SlashCommandStringOption {
    // maxLengthValidator.parse(max);

    Reflect.set(this, 'max_length', max);
    return this;
  }

  public setMinLength (min: number): SlashCommandStringOption {
    // minLengthValidator.parse(min);

    Reflect.set(this, 'min_length', min);
    return this;
  }
}
