var fs = require("fs");
const Ajv = require("ajv");
const pack = require("ajv-pack");
const swagger = require("./swagger.json");
const prettier = require("prettier");
const packageJson = require("../package.json");

// Create the JSON schema
const schema = Object.assign({}, swagger.definitions.SequenceDiagram, {
  definitions: swagger.definitions,
});

// Generate .js
const ajv = new Ajv({ sourceCode: true }); // this option is required
const validate = ajv.compile(schema);
let jsCode = pack(ajv, validate);
jsCode = prettier.format(jsCode, packageJson.prettier);

// Write to file
const jsFile = fs.createWriteStream(__dirname + "/verify-SequenceDiagram.js");
jsFile.write(
  `/* DO NOT EDIT THIS FILE DIRECTLY, IT IS AUTO-GENERATED BY ${__filename.slice(
    __dirname.length + 1
  )}!!! */\n` + jsCode
);
jsFile.close();
