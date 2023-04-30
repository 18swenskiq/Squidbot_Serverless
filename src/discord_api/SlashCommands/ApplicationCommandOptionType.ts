export enum ApplicationCommandOptionType {
	Subcommand = 1,
	SubcommandGroup,
	String,
	Integer,
	Boolean,
	User,
	Channel,
	Role,
	Mentionable,
	Number,
	Attachment,
}

export interface APIApplicationCommandOptionChoice<ValueType = string | number> {
	name: string;
	value: ValueType;
}