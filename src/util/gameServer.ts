export type Game = 'cs2';

export interface GameServer {
    nickname: string;
    ip: string;
    game: Game;
    rconPassword: string;
    countryCode: string;
}