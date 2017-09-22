const AWS = require("aws-sdk");
const DynamoDbLocal = require("dynamodb-local");

AWS.config.update({
  accessKeyId: "AKID",
  secretAccessKey: "SECRET",
  region: "eu-west-1",
  endpoint: "http://localhost:8000",
});
const tableName = "io.sequencediagram.dynamodb.test";

DynamoDbLocal.launch(8000, null, ["-sharedDb", "-inMemory"])
  .then(_ => {
    return new Promise((resolve, reject) => {
      var dynamodb = new AWS.DynamoDB();

      dynamodb.createTable(
        {
          TableName: tableName,
          KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },
            { AttributeName: "revision", KeyType: "RANGE" },
          ],
          AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "revision", AttributeType: "N" },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
        console.log
      );
    });
  })
  .catch(console.log);
