/* eslint-disable no-case-declarations */
import fs from 'fs';
import path from 'path';
import { Interaction, InteractionData } from './discord_api/interaction';
import { CommandDescription } from './discord_api/command';
import { StaticDeclarations } from './util/staticDeclarations';
import { CommandResult } from './discord_api/commandResult';
import { HandleComponentInteraction } from './interactions/handleComponentInteraction';
import { DiscordApiRoutes } from './discord_api/apiRoutes';

exports.handler = async (event: any) => {
    const strBody = event; // should be string, for successful sign
    const body: Interaction = JSON.parse(strBody);

    // Creating static declarations
    StaticDeclarations.GenerateOptions();

    const commands: CommandDescription[] = [];

    let commandsPath: string;
    let commandFiles: string[];
    if (body.type === 2) {
        // Load Commands (only if type 2)
        commandsPath = path.resolve(__dirname, 'commands/');
        commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            try {
                const command: CommandDescription = require(`${commandsPath}/${file}`);
                commands.push(command);
            } catch (exception: any) {
                console.log(`Could not load command: ${file}`);
                console.log(exception);
            }
        }

        console.log('Commands loaded!');
    }

    switch (body.type) {
        case 2:
            const bodyData = <InteractionData>body.data;
            const chosenCommand = commands.find((c) => c.data.name === bodyData.name);

            if (chosenCommand != null) {
                const result = await chosenCommand.execute(body);
                console.log('Returning result:', result);
                await sendCommandResponse(body, result);
                return { statusCode: 200 };
            } else {
                return { statusCode: 404 };
            }
        case 3:
            // Handle interaction
            await HandleComponentInteraction.Handle(body);
            await DiscordApiRoutes.createFollowupMessage(body, { content: 'Successfully modified roles!' });
            return { statusCode: 200 };
    }
};

async function sendCommandResponse(interaction: Interaction, result: CommandResult): Promise<void> {
    const body: any = {};

    const message = result.message !== undefined ? result.message : true;
    body.content = message;

    if (result.embeds !== undefined && result.embeds.length > 0) {
        body.embeds = result.embeds;
    }

    if (result.components !== undefined && result.components.length > 0) {
        body.components = result.components;
    }

    const util = require('util');
    console.log(util.inspect(body, { showHidden: false, depth: null, colors: false }));

    try {
        if (result.sendEphemeralDeleteOriginal) {
            body.flags = 64;

            const followupContent =
                result.firstResponseMessage === '' ? 'Placeholder Message' : result.firstResponseMessage;

            await DiscordApiRoutes.createFollowupMessage(interaction, { content: followupContent });
            await DiscordApiRoutes.createFollowupMessage(interaction, body);

            if (result.deleteFirstResponse) {
                await DiscordApiRoutes.deleteInitialInteractionResponse(interaction);
            }
        } else {
            await DiscordApiRoutes.editInitialInteractionResponse(interaction, body);
        }
    } catch (error: any) {
        console.log('Error Data', error.response.data);
        console.log('Error Status', error.response.status);
        console.log('Error Response Headers', error.response.headers);
    }
}
