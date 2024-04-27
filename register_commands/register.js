const axios = require("axios").default;
var fs = require("fs");
var path = require("path");

let url = `https://discord.com/api/v8/applications/${process.env.APP_ID}/commands`;

const headers = {
  Authorization: `Bot ${process.env.BOT_TOKEN}`,
  "Content-Type": "application/json",
};

// Load Commands
let commands = [];

fs.cpSync(
  path.resolve(__dirname, "../dist/"),
  path.resolve(__dirname, "../commands_temp_dist/"),
  { recursive: true }
);

let commandsPath = path.resolve(__dirname, "../commands_temp_dist/commands/");

// We need to modify all command files to remove any and all decorators
const modelsPath = path.resolve(
  __dirname,
  "../commands_temp_dist/database_models/"
);
const files = fs.readdirSync(modelsPath);
console.log(`Found ${files.length} files to modify`);
files.forEach((file) => {
  console.log(`Modifying ${file}...`);
  file = path.join(modelsPath, file);
  let fileText = fs.readFileSync(file, "utf8");
  console.log(`Old File text: ${fileText}`);
  fileText = fileText
    .replace("let _classDecorators", "//let _classDecorators")
    .replace(
      "let _id_decorators;",
      "//let _id_decorators;\nlet _classDecorators = null;\nlet _id_decorators = null;"
    )
    .replace("var __esDecorate = ", "/*\nvar __esDecorate = ")
    .replace("var __runInitializers", "*/\nvar __runInitializers")
    .replace("_id_decorators = [", "//_id_decorators = [");
  fileText = fileText.replace("__esDecorate", "//__esDecorate");
  console.log(`New File text: ${fileText}`);
  console.log("-------------------");
  fs.writeFileSync(file, fileText);
});

let commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

console.log(`Loading ${commandFiles.length} commands...`);

for (const file of commandFiles) {
  let command = require(`${commandsPath}/${file}`);
  commands.push(command);
}

let command_data = [];

for (var command of commands) {
  let localCommand = {
    name: command.data.name,
    description: command.data.description,
    type: 1,
  };

  if (command.data.options.length > 0) {
    localCommand["options"] = [];
    for (var option of command.data.options) {
      let localOption = {
        name: option.name,
        description: option.description,
        type: option.type,
        required: option.required,
        autocomplete: option.autocomplete,
      };

      if (option["choices"]) {
        localOption["choices"] = [];
        for (var choice of option.choices) {
          localOption.choices.push({
            name: choice.name,
            value: choice.value,
          });
        }
      }

      localCommand.options.push(localOption);
    }
  }

  if (command.data.default_member_permissions.length > 0) {
    if (command.data.default_member_permissions.length > 1) {
      localCommand["default_member_permissions"] =
        command.data.default_member_permissions.reduce(function (a, b) {
          return a | b;
        });
    } else {
      localCommand["default_member_permissions"] =
        command.data.default_member_permissions[0];
    }
  }

  command_data.push(localCommand);
}

console.log("commands:");
console.log(command_data);

console.log(`Attempting to register ${command_data.length} commands...`);

var util = require("util");

axios
  .put(url, JSON.stringify(command_data), {
    headers: headers,
  })
  .catch((error) => {
    console.log(util.inspect(error, false, null));
    throw Error("da error");
  });
