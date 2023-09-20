import { AllowedMention } from './allowedMention';
import { Embed } from './embed';
import { MessageComponent } from './messageComponent';

export class CommandResult {
  message?: string;
  embeds?: Embed[];
  components?: MessageComponent[];
  allowed_mentions: AllowedMention;
  sendEphemeralDeleteOriginal: boolean;
  firstResponseMessage: string;
  deleteFirstResponse: boolean;

  constructor (message: string, mentionUser: boolean, sendEphemeralDeleteOriginal: boolean, firstResponseMessage = '', deleteFirstResponse = false) {
    this.message = message;
    this.allowed_mentions = new AllowedMention(mentionUser);
    this.sendEphemeralDeleteOriginal = sendEphemeralDeleteOriginal;
    this.firstResponseMessage = firstResponseMessage;
    this.deleteFirstResponse = deleteFirstResponse;
  }
}
