const AWS = require('aws-sdk');
const DynamoDbLocal = require('dynamodb-local');
const path = require('path');

AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'eu-west-1',
  endpoint: 'http://localhost:8000',
});
const tableName = 'io.sequencediagram.dynamodb.test';
const port = 8000;

DynamoDbLocal.configureInstaller({
  installPath: path.join(process.env.HOME || '/tmp', 'dynamodb-local'),
});
DynamoDbLocal.launch(port, null, ['-sharedDb', '-inMemory'])
  .then(_ => {
    return new Promise((resolve, reject) => {
      var dynamodb = new AWS.DynamoDB();

      dynamodb.createTable(
        {
          TableName: tableName,
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'revision', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'revision', AttributeType: 'N' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log('dynamodb-local listening on port ' + port);
          }
        }
      );
    });
  })
  .catch(console.log);
