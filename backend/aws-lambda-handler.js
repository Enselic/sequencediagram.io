/**
 * Run by AWS Lambda.
 * Is also run by end-to-end test cases without involvement of AWS.
 */

'use strict';

const AWS = require('aws-sdk');
const crypto = require('crypto');

AWS.config.update({
  region: 'eu-west-1',
});

function generateRandomId() {
  // Somewhat unamgious numbers and chars. Length should be power of 2.
  const CHARS = '023456789abcdefghijkmnpqrstuvxyz';

  let randomString = '';

  let chunks = 4;
  const buffer = crypto.pseudoRandomBytes(chunks * 2);
  while (chunks > 0) {
    chunks--;
    const int32 = buffer.readInt16BE(chunks * 2);
    const char1 = (int32 & 0b0000000000011111) >> 0;
    const char2 = (int32 & 0b0000001111100000) >> 5;
    const char3 = (int32 & 0b0111110000000000) >> 10;

    randomString += CHARS[char1] + CHARS[char2] + CHARS[char3];
  }

  return randomString;
}

function createError(message, code) {
  return { error: { message, code } };
}

module.exports.handler = (event, context, callback) => {
  const done = (error, res) => {
    callback(null, {
      statusCode: error ? '400' : '200',
      body: JSON.stringify(error ? error : res),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.stageVariables.allowedOrigin
          ? event.stageVariables.allowedOrigin
          : '*',
      },
    });
  };

  if (event.httpMethod === 'POST' && (!event.body || event.body.length <= 0)) {
    done(createError('Need body of length > 0 when POST:ing', 'MissingBody'));
  } else if (event.httpMethod === 'POST' && event.body.length > 50000) {
    done(
      createError(
        'Max diagram size 50 kB (let us know if you need more)',
        'TooLarge'
      )
    );
  } else {
    const id = event.pathParameters && event.pathParameters.sequenceDiagramId;
    const revision = event.pathParameters && event.pathParameters.revision;
    const sequenceDiagram = event.body ? JSON.parse(event.body) : undefined;
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
            'attribute_not_exists(id) and attribute_not_exists(revision)',
        },
        function(err, data) {
          done(err, Item);
        }
      );
    }

    function getRevisionHelper(id, revision, callback) {
      let KeyConditionExpression;
      let ExpressionAttributeNames;
      let ExpressionAttributeValues;
      if (revision) {
        KeyConditionExpression = '#id = :id AND #revision = :revision';
        ExpressionAttributeNames = {
          '#id': 'id',
          '#revision': 'revision',
        };
        ExpressionAttributeValues = {
          ':id': id,
          ':revision': parseInt(revision, 10),
        };
      } else {
        KeyConditionExpression = '#id = :id';
        ExpressionAttributeNames = {
          '#id': 'id',
        };
        ExpressionAttributeValues = {
          ':id': id,
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
        function(err, data) {
          const Item = data && data.Items && data.Items[0];
          if (Item) {
            callback(null, Item);
          } else {
            callback(
              err ? err : createError('Query result was empty', 'EmptyQuery')
            );
          }
        }
      );
    }

    if (
      event.httpMethod === 'POST' &&
      (typeof sequenceDiagram !== 'object' ||
        !Array.isArray(sequenceDiagram.objects) ||
        !Array.isArray(sequenceDiagram.messages))
    ) {
      done(
        createError(
          "JSON request body missing 'objects' or 'messages' array properties. " +
            'Got: ' +
            JSON.stringify(sequenceDiagram),
          'MissingProperties'
        )
      );
    } else if (
      event.resource === '/sequencediagrams' &&
      event.httpMethod === 'POST'
    ) {
      putHelper(generateRandomId(), 1);
    } else if (
      event.resource === '/sequencediagrams/{sequenceDiagramId}' &&
      event.httpMethod === 'GET'
    ) {
      getRevisionHelper(id, undefined, done);
    } else if (
      event.resource === '/sequencediagrams/{sequenceDiagramId}/{revision}' &&
      event.httpMethod === 'GET'
    ) {
      getRevisionHelper(id, revision, done);
    } else if (
      event.resource === '/sequencediagrams/{sequenceDiagramId}' &&
      event.httpMethod === 'POST'
    ) {
      getRevisionHelper(id, undefined, function(err, Item) {
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
          'UnknownRequest'
        )
      );
    }
  }
};
