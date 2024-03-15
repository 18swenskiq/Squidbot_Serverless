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
        console.log('Submitted body:');
        console.log(body);

        console.log('Submitted Interaction Data:');
        console.log(body.data);
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

    console.log('The body');
    console.log(body.type);
    switch (body.type) {
        case 2:
            // Case 2: Submitting command for result
            const bodyData = <InteractionData>body.data;
            const chosenCommand = commands.find((c) => c.data.name === bodyData.name);
            console.log('inside block');
            console.log('chosen command');
            console.log(chosenCommand);

            if (chosenCommand != null) {
                if (chosenCommand.data.valid_users && !chosenCommand.data.valid_users.includes(body.member.user.id)) {
                    console.log('Inside of invalid block');
                    return new CommandResult('You are not in the valid users list for this command', false, false);
                }

                try {
                    console.log('executing');
                    const result = await chosenCommand.execute(body);
                    console.log('Returning result:', result);
                    await sendCommandResponse(body, result);
                    return { statusCode: 200 };
                } catch (error: any) {
                    let stackTrace = error.stack.split('\n');
                    stackTrace.splice(0, 2);
                    stackTrace = stackTrace.join('\n"');

                    // Only send a stack trace if I used the comamnd
                    if (body.member.user.id === '66318815247466496') {
                        await sendCommandResponse(
                            body,
                            new CommandResult(`\`\`\`\n${stackTrace}\n\`\`\`\n ERROR: ${error}`, true, false)
                        );
                    } else {
                        await sendCommandResponse(body, new CommandResult(`ERROR: ${error}`, true, false));
                    }
                    return { statusCode: 500 };
                }
            } else {
                return { statusCode: 404 };
            }
        case 3:
            // Case 3: Handle component interaction
            await HandleComponentInteraction.Handle(body);
            // await DiscordApiRoutes.createFollowupMessage(body, { content: 'Successfully modified roles!' });
            return { statusCode: 200 };
        case 4:
            // Case 4: Getting autocomplete results for command
            if (body.type === 4) {
                console.log(body.data);
            }

            const coolBodyData = <InteractionData>body.data;
            const coolChosenCommand = commands.find((c) => c.data.name === coolBodyData.name);

            if (coolChosenCommand != null) {
                const result = await coolChosenCommand.autocomplete(body);
                return { data: JSON.stringify(result) };
            } else {
                return { data: null };
            }
    }
};

async function sendCommandResponse(interaction: Interaction, result: CommandResult): Promise<void> {
    console.log('sending the command response');
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
