import Rcon from 'rcon-ts';

export abstract class RconUtils {
    public static async SendRconCommand(
        rconIp: string,
        rconPort: string,
        rconPassword: string,
        command: string
    ): Promise<string> {
        const rcon = new Rcon({
            host: rconIp,
            port: Number(rconPort),
            password: rconPassword,
            timeout: 5000,
        });

        rcon.connect();
        let response = await rcon.send(command);
        rcon.disconnect();

        const errors = rcon.errors;

        if (errors.length) {
            return `ERROR: ${errors.join(', ')}`;
        }

        if (response === '') {
            return 'No response from server';
        }

        return response;
    }
}
