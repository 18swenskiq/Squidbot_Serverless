import * as ftp from 'basic-ftp';
import { CommandResult } from '../discord_api/commandResult';

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
        } catch (err: any) {
            // Its possible that the server is FTP instead of SFTP. In that case just try again
            try {
                await client.access({
                    host: ftpHost,
                    port: Number(ftpPort),
                    user: ftpUser,
                    password: ftpPassword,
                    secure: false,
                });
            } catch (err: any) {
                return 'unable to connect';
            }
        }

        var result = await this.FindFileReturnPath('pak01_238.vpk', client);
        if (result == null) {
            returnValue = 'Unable to find game folder';
        } else {
            returnValue = result;
        }

        client.close();

        return returnValue;
    }

    private static async FindFileReturnPath(file: string, client: ftp.Client): Promise<string | null> {
        let currentDir = await client.pwd();

        let directoriesToCheck: string[] = [currentDir];
        let directoriesChecked: string[] = [];

        while (true) {
            const files = await client.list();

            // Step 1: Check to see if the file we are searching for is here
            var matchFile = files.find((f) => f.name.includes(file));
            if (matchFile) {
                return matchFile.name;
            }

            // Step 2: If the file is not here, make a list of all directories here
            var directories = files.filter((f) => f.isDirectory === true);
            if (directories.length === 0) {
                return null;
            }

            // Step 3: Add to the list of directories to check if its not there, as well as if its not already been checked
            directories.forEach((d) => {
                if (!directoriesToCheck.includes(d.name) && !directoriesChecked.includes(d.name)) {
                    directoriesToCheck.push(d.name);
                }
            });

            // Step 4: Remove this directory from the list of directories to check
            directoriesChecked.push(currentDir);
            let idx = directoriesToCheck.indexOf(currentDir);
            directoriesToCheck.splice(idx, 1);

            // Step 5: If there are no more directories to check, we didn't find it. Return null
            if (directoriesToCheck.length === 0) {
                return null;
            }

            // Step 6: Set the current directory to the next item in the list of dirs to check
            currentDir = directoriesToCheck[0];

            // Step 7: Try again
            // Note: Hopefully this is never infinite
        }
    }
}
