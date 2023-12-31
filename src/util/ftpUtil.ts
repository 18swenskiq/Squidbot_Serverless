import * as ftp from 'basic-ftp';

export abstract class FTPUtil {
    public static async FindGameFolder(
        ftpHost: string,
        ftpPort: string,
        ftpUser: string,
        ftpPassword: string
    ): Promise<string> {
        const client = new ftp.Client();
        client.ftp.verbose = true;

        let returnValue = 'none :(';

        try {
            await client.access({
                host: ftpHost,
                port: Number(ftpPort),
                user: ftpUser,
                password: ftpPassword,
                secure: true,
            });

            const files = await client.list();

            // I absolutely hate this but we will look for a pak file that should only exist in the game folder like pak01_238.vpk
            const pakFile = files.find((f) => f.name.includes('pak01_238.vpk'));

            if (pakFile == undefined) {
                returnValue = 'Unable to find game folder';
            } else {
                returnValue = pakFile.name;
            }
        } catch (err) {
            console.log(err);
        }
        client.close();

        return returnValue;
    }
}
