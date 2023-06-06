import { ChannelType } from './channelType';
import { Emoji } from './emoji';

export abstract class MessageComponent {
  abstract type: number;
}

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: Pick<Emoji, 'id' | 'name' | 'animated'>;
  default: boolean;
}

export abstract class SelectMenuComponent extends MessageComponent {
  custom_id?: string;
  options?: SelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled: boolean = false;
}

export class ActionRowComponent extends MessageComponent {
  type = 1;
}

export class ButtonComponent extends MessageComponent {
  type = 2;
}

export class StringSelectComponent extends SelectMenuComponent {
  type = 3;
}

export class TextInputComponent extends MessageComponent {
  type = 4;
}

export class UserSelectComponent extends SelectMenuComponent {
  type = 5;
}

export class RoleSelectComponent extends SelectMenuComponent {
  type = 6;
}

export class MentionableSelectComponent extends SelectMenuComponent {
  type = 7;
}

export class ChannelSelect extends SelectMenuComponent {
  type = 8;
  channel_types?: ChannelType[];
}
