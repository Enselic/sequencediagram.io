const Ajv = require('ajv');
const pack = require('ajv-pack');
const loaderUtils = require('loader-utils');

module.exports = function(source) {
  const options = loaderUtils.getOptions(this);

  // Get JSON schema from swagger
  const swagger = JSON.parse(source);
  const schema = Object.assign({}, swagger.definitions[options.name], {
    definitions: swagger.definitions,
  });

  // Return compiled validator
  const ajv = new Ajv({ sourceCode: true });
  const validate = ajv.compile(schema);
  return pack(ajv, validate);
};
