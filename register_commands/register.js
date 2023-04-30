const axios = require('axios').default;
var fs = require('fs');
var path = require('path');

let url = `https://discord.com/api/v8/applications/${process.env.APP_ID}/commands`

const headers = {
  "Authorization": `Bot ${process.env.BOT_TOKEN}`,
  "Content-Type": "application/json"
}

// Load Commands
let commands = [];
let commandsPath = path.resolve(__dirname, "../dist/commands/");
let commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
console.log(`Loading ${commandFiles.length} commands...`);
for (const file of commandFiles) {
      let command = require(`${commandsPath}/${file}`);
      commands.push(command);
 }

let command_data = [];

for (var command of commands) {
	let localCommand = { 
		"name": command.data.name,
		"description": command.data.description,
		"type": 1
	};

	if (command.data.options.length > 0) {
		localCommand['options'] = [];
		for (var option of command.data.options) {
			localCommand.options.push({
				"name": option.name,
				"description": option.description,
				"type": option.type,
				"required": option.required
			});
		}
	}

	command_data.push(localCommand);
}

console.log("commands:");
console.log(command_data);

console.log(`Attempting to register ${command_data.length} commands...`);

axios.put(url, JSON.stringify(command_data), {
  headers: headers,
})