import { AllowedMention } from './allowedMention';
import { Embed } from './embed';
import { MessageComponent } from './messageComponent';

export class CommandResult {
  message?: string;
  embeds?: Embed[];
  components?: MessageComponent[];
  allowed_mentions: AllowedMention;
  sendEphemeralDeleteOriginal: boolean;

  constructor (message: string, mentionUser: boolean, sendEphemeralDeleteOriginal: boolean) {
    this.message = message;
    this.allowed_mentions = new AllowedMention(mentionUser);
    this.sendEphemeralDeleteOriginal = sendEphemeralDeleteOriginal;
  }
}
