export class User
{
    id: Snowflake;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;

    constructor(id: string, username: string, avatar: string, discriminator: string, public_flags: number) {
        this.id = id;
        this.username = username;
        this.avatar = avatar;
        this.discriminator = discriminator;
        this.public_flags = public_flags;
    }

}