import { Snowflake } from './snowflake';

export class User {
  id: Snowflake;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;

  constructor (id: string, username: string, avatar: string, discriminator: string, publicFlags: number) {
    this.id = id;
    this.username = username;
    this.avatar = avatar;
    this.discriminator = discriminator;
    this.public_flags = publicFlags;
  }
}
