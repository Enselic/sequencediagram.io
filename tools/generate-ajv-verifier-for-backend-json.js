/**
 * Can be used to figure out the code coverage for testing JSON
 * schema validation.
 */
const Ajv = require('ajv');
const pack = require('ajv-pack');
const swagger = require('../backend/api-server/swagger.json');

const ajv = new Ajv({ sourceCode: true }); // this option is required
const schema = Object.assign({}, swagger.definitions.SequenceDiagram, {
  definitions: swagger.definitions,
});
const validate = ajv.compile(schema);
const moduleCode = pack(ajv, validate);
console.log(moduleCode);
