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
    constructor(
        custom_id: string,
        style: 1 | 2,
        label: string,
        min_length: number = 0,
        max_length: number = 4000,
        required: boolean = true,
        value: string = '',
        placeholder: string = ''
    ) {
        super();
        this.custom_id = custom_id;
        this.style = style;
        this.label = label;
        this.min_length = min_length;
        this.max_length = max_length;
        this.required = required;
        this.value = value;
        this.placeholder = placeholder;
    }

    type = 4;
    custom_id: string;
    style: 1 | 2;
    label: string;
    min_length?: number;
    max_length?: number;
    required?: boolean;
    value?: string;
    placeholder?: string;
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
