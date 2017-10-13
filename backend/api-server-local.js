/**
 * A backend server that e.g. test cases can start and stop.
 * Depends on a AWS DynamoDB server. You can run one locally
 * with:
 *
 * node backend/dynamodb-local.js
 */

/* Useful commands:

id=$( curl -v -X POST localhost:4000/sequencediagrams | sed 's/.*"id":"\([^"]\+\)".*}/\1/g')
curl -v -X POST -H "Content-Type: application/json" -d '{"objects":["TODO"],"messages":["TODO"]}' localhost:4000/sequencediagrams/${id}
curl -v localhost:4000/sequencediagrams/${id}

*/

'use strict';

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const AWS = require('aws-sdk');
const awsLambda = require('./aws-lambda-handler');

AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'eu-west-1',
  endpoint: 'http://localhost:8000',
});
const tableName = 'io.sequencediagram.dynamodb.test';
const dynamoLocalPort = 8000;
const port = 4000;

function ApiServerLocal(sequencediagrams) {
  this.app = express();
  this.app.use(bodyParser.json());
  this.app.use(cors());

  const logging = 0;
  if (logging) {
    this.app.use(morgan('combined'));
    morganBody(this.app);
  }

  function awsLambdaWrapper(req, res, resource) {
    const event = {
      resource: resource,
      body: JSON.stringify(req.body),
      httpMethod: req.method,
      pathParameters: req.params,
      stageVariables: { tableName },
    };
    awsLambda.handler(event, null, (err, data) => {
      if (err) {
        throw err;
      }
      res.status(parseInt(data.statusCode, 10));
      for (var header in res.headers) {
        if (res.headers.hasOwnProperty(header)) {
          res.setHeader(header, res.headers[header]);
        }
      }
      res.send(data.body);
    });
  }

  this.app.all('/sequencediagrams', (req, res) => {
    awsLambdaWrapper(req, res, req.url);
  });

  this.app.all('/sequencediagrams/:sequenceDiagramId', (req, res) => {
    awsLambdaWrapper(req, res, '/sequencediagrams/{sequenceDiagramId}');
  });

  this.app.all('/sequencediagrams/:sequenceDiagramId/:revision', (req, res) => {
    awsLambdaWrapper(
      req,
      res,
      '/sequencediagrams/{sequenceDiagramId}/{revision}'
    );
  });
}

ApiServerLocal.prototype = {
  listen() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        this.server = this.app.listen(port, resolve);

        // For quick .close()
        // See https://github.com/nodejs/node-v0.x-archive/issues/9066
        const timeoutInMs = 1000;
        this.server.setTimeout(timeoutInMs);

        this.server.on('error', e => {
          this.server = null;
          reject();
        });
      } else {
        resolve();
      }
    });
  },

  close() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.on('error', reject);
        this.server.close(resolve);
      } else {
        resolve();
      }
      this.server = null;
    });
  },
};

if (require.main === module) {
  const server = new ApiServerLocal();
  server
    .listen()
    .then(
      _ => console.log('API server listening on port ' + port),
      console.log
    );
} else {
  module.exports = ApiServerLocal;
}
