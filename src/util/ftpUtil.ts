import * as ftp from 'basic-ftp';
import * as fs from 'fs';

export abstract class FTPUtil {
    public static async FindGameFolder(
        ftpHost: string,
        ftpPort: string,
        ftpUser: string,
        ftpPassword: string
    ): Promise<string | null> {
        var client = await this.GetNewConnectedClient(ftpHost, ftpPort, ftpUser, ftpPassword);
        if (client === null) {
            return null;
        }

        var result = await this.FindFileReturnPath('pak01_238.vpk', client);
        client.close();
        if (result == null) {
            return null;
        } else {
            const listOfStuff = result.split('/');
            listOfStuff.pop();
            return listOfStuff.join('/');
        }
    }

    private static async FindFileReturnPath(file: string, client: ftp.Client): Promise<string | null> {
        let currentDir = await client.pwd();

        let directoriesToCheck: string[] = [currentDir];
        let directoriesChecked: string[] = [];

        while (true) {
            const files = await client.list();
            console.log(`Current Directory:`, currentDir);
            console.log('List of files:');
            console.log(files);

            // Step 1: Check to see if the file we are searching for is here
            var matchFile = files.find((f) => f.name.includes(file));
            if (matchFile) {
                console.log(`Found match file: ${matchFile.name}`);
                const prefix = currentDir === '/' ? currentDir : `${currentDir}/`;
                return `${prefix}${matchFile.name}`;
            }

            console.log(`File match not found, looking at other files in directory`);
            // Step 2: If the file is not here, make a list of all directories here
            var directories = files.filter((f) => f.isDirectory === true);

            console.log('Directories found in current working dir:');
            console.log(directories);
            // Step 3: Add to the list of directories to check if its not there, as well as if its not already been checked
            directories.forEach((d) => {
                if (!directoriesToCheck.includes(d.name) && !directoriesChecked.includes(d.name)) {
                    console.log(`Adding ${d.name} to list of directories to check`);

                    const prefix = currentDir === '/' ? currentDir : `${currentDir}/`;
                    directoriesToCheck.push(`${prefix}${d.name}`);
                }
            });

            console.log('Removing the current directory from the list of dirs to check');
            // Step 4: Remove this directory from the list of directories to check
            directoriesChecked.push(currentDir);
            let idx = directoriesToCheck.indexOf(currentDir);
            directoriesToCheck.splice(idx, 1);

            // Step 5: If there are no more directories to check, we didn't find it. Return null
            if (directoriesToCheck.length === 0) {
                console.log('No directories remaining to check :(');
                return null;
            }

            // Step 6: Set the current directory to the next item in the list of dirs to check
            currentDir = directoriesToCheck[0];
            await client.cd(currentDir);

            // Step 7: Try again
            // Note: Hopefully this is never infinite
        }
    }

    public static async AddCFGToFTP(
        ftpHost: string,
        ftpPort: string,
        ftpUser: string,
        ftpPassword: string,
        cfgFolder: string,
        cfgName: string,
        cfgText: string
    ): Promise<boolean> {
        // Connect
        var client = await this.GetNewConnectedClient(ftpHost, ftpPort, ftpUser, ftpPassword);
        if (client === null) {
            return false;
        }

        // Check if CFG file already exists
        await client.cd(cfgFolder);
        const files = await client.list();
        const cfgFile = files.find((f) => f.name === cfgName);

        // If it exists, delete it
        if (cfgFile) {
            await client.remove(cfgFile.name, false);
        }

        const Readable = require('stream').Readable;
        var textStream = new Readable();
        textStream.push(cfgText);
        textStream.push(null);
        // Upload our new CFG
        await client.uploadFrom(textStream, `${cfgFolder}/${cfgName}`);

        // Disconnect
        client.close();

        return true;
    }

    public static async GetDemo(
        ftpHost: string,
        ftpPort: string,
        ftpUser: string,
        ftpPassword: string,
        gameFolderPath: string,
        demoName: string
    ): Promise<string | null> {
        var client = await this.GetNewConnectedClient(ftpHost, ftpPort, ftpUser, ftpPassword);
        if (client === null) {
            return null;
        }

        await client.cd(gameFolderPath);
        const filePath = `/tmp/${demoName}.dem`;
        const dest = fs.createWriteStream(filePath, { encoding: 'binary' });

        await client.downloadTo(dest, `${gameFolderPath}/${demoName}.dem`);

        dest.close();

        return filePath;
    }

    private static async GetNewConnectedClient(
        ftpHost: string,
        ftpPort: string,
        ftpUser: string,
        ftpPassword: string
    ): Promise<ftp.Client | null> {
        const client = new ftp.Client();
        client.ftp.verbose = false;

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
                return null;
            }
        }

        return client;
    }
}
