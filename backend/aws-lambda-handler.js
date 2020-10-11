/**
 * Run by AWS Lambda.
 * Is also run by end-to-end test cases without involvement of AWS.
 */

"use strict";

const AWS = require("aws-sdk");
const crypto = require("crypto");
const sequenceDiagramSchemaValidator = require("./verify-SequenceDiagram");

AWS.config.update({
  region: "eu-west-1",
});

function generateRandomId() {
  // [0-9a-zA-Z] except ambiguous chars in some fonts like l and 1 and I
  const CHARS = "023456789ABCDEFGHJKLMNPQRSTUVXYZabcdefghijkmnpqrstuvxyz";

  let randomString = "";

  const randomBytesPerChar = 2;
  let len = 10;
  const buffer = crypto.randomBytes(len * randomBytesPerChar);
  while (len > 0) {
    len--;

    // Ensure uniform random distribution
    const uint16 = buffer.readUInt16BE(len * randomBytesPerChar);
    // Obtain a value that's in the range [0,1)
    const normalized = uint16 / (1 << (randomBytesPerChar * 8));
    const index = Math.floor(CHARS.length * normalized);

    randomString += CHARS[index];
  }

  return randomString;
}

function createError(message, code, innererror) {
  return { error: { message, code, innererror } };
}

const handler = (event, context, callback) => {
  let errorInHandler = false;
  const done = (error, res) => {
    if (error) {
      errorInHandler = true;
    }
    callback(null, {
      statusCode: error ? "400" : "200",
      body: JSON.stringify(error ? error : res),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": event.stageVariables.allowedOrigin
          ? event.stageVariables.allowedOrigin
          : "*",
      },
    });
  };

  let sequenceDiagram = event.body ? JSON.parse(event.body) : undefined;
  if (event.httpMethod === "POST") {
    if (event.body && event.body.length > 50000) {
      done(
        createError(
          "Max diagram size 50 kB (let us know if you need more)",
          "TooLarge"
        )
      );
    } else if (!sequenceDiagramSchemaValidator(sequenceDiagram)) {
      done(
        createError(
          "Request schema validation failed",
          "FailedSchemaValidation",
          sequenceDiagramSchemaValidator.errors
        )
      );
    }
  }

  if (!errorInHandler) {
    const id = event.pathParameters && event.pathParameters.sequenceDiagramId;
    const revision = event.pathParameters && event.pathParameters.revision;
    const docClient = new AWS.DynamoDB.DocumentClient();
    const tableName = event.stageVariables.tableName;

    function putHelper(id, revision) {
      const creationTimeUtc = Math.floor(new Date().getTime() / 1000);
      const Item = {
        id,
        revision,
        sequenceDiagram,
        creationTimeUtc,
      };

      docClient.put(
        {
          TableName: tableName,
          Item,
          // Never overwrite an existing item; we don't do authentication yet
          // and by keeping a history of earlier states no data can be lost
          // by malicoius users. It will also prevent two concurrent puts
          // by different users to overwrite one another (instead they will)
          // get an error message/warning in the UI
          ConditionExpression:
            "attribute_not_exists(id) and attribute_not_exists(revision)",
        },
        function (err, data) {
          done(err, Item);
        }
      );
    }

    function getRevisionHelper(id, revision, callback) {
      let KeyConditionExpression;
      let ExpressionAttributeNames;
      let ExpressionAttributeValues;
      if (revision) {
        KeyConditionExpression = "#id = :id AND #revision = :revision";
        ExpressionAttributeNames = {
          "#id": "id",
          "#revision": "revision",
        };
        ExpressionAttributeValues = {
          ":id": id,
          ":revision": parseInt(revision, 10),
        };
      } else {
        KeyConditionExpression = "#id = :id";
        ExpressionAttributeNames = {
          "#id": "id",
        };
        ExpressionAttributeValues = {
          ":id": id,
        };
      }

      docClient.query(
        {
          TableName: tableName,
          KeyConditionExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          Limit: 1,
          ScanIndexForward: false,
        },
        function (err, data) {
          const Item = data && data.Items && data.Items[0];
          if (Item) {
            callback(null, Item);
          } else {
            callback(
              err ? err : createError("Query result was empty", "EmptyQuery")
            );
          }
        }
      );
    }

    if (event.resource === "/sequencediagrams" && event.httpMethod === "POST") {
      putHelper(generateRandomId(), 1);
    } else if (
      event.resource === "/sequencediagrams/{sequenceDiagramId}" &&
      event.httpMethod === "GET"
    ) {
      getRevisionHelper(id, undefined, done);
    } else if (
      event.resource === "/sequencediagrams/{sequenceDiagramId}/{revision}" &&
      event.httpMethod === "GET"
    ) {
      getRevisionHelper(id, revision, done);
    } else if (
      event.resource === "/sequencediagrams/{sequenceDiagramId}" &&
      event.httpMethod === "POST"
    ) {
      getRevisionHelper(id, undefined, function (err, Item) {
        if (err) {
          done(err);
        } else {
          const newRevision = Item.revision + 1;
          putHelper(id, newRevision);
        }
      });
    } else {
      done(
        createError(
          "I don't know what to do with: " + JSON.stringify(event),
          "UnknownRequest"
        )
      );
    }
  }
};

module.exports = { handler };
