const fs = require('fs');
const AWS = require('aws-sdk');
const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const awsLambda = require('./aws-lambda-handler');
const dynamodbUtils = require('./dynamodb-utils');

const dynamoDbLocalUrl = `http://localhost:${process.env.DYNAMODB_LOCAL_PORT}`;
const dynamoDbTableName = 'io.sequencediagram.dynamodb.test';

const apiServerPort = process.env.API_SERVER_PORT;

AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'eu-west-1',
  endpoint: dynamoDbLocalUrl,
});

const dynamoDbStarted = dynamodbUtils.startDynamoDbLocal(
  process.env.DYNAMODB_LOCAL_PORT,
  dynamoDbTableName
);

function ensureDynamoDbLocalRuns(req, res, next) {
  const clientReq = http.get(dynamoDbLocalUrl);
  clientReq.on('error', e => {
    res.status(500);
    res.setHeader('Content-Type', 'application/json');
    res.send({
      error: {
        code: e.code,
        message:
          'dynamodb-local is not running. ' +
          'request will timeout. failing early',
        innererror: e,
      },
    });
  });
  clientReq.on('response', _ => next());
}

function AwsLambdaExpressWrapper() {
  this.app = express();
  this.app.use(cors());
  this.app.use(ensureDynamoDbLocalRuns);
  this.app.use(bodyParser.json());

  const logging = 0;
  if (logging) {
    this.app.use(morgan('combined'));
    morganBody(this.app);
  }
  const that = this;
  this.app.use(function(req, res, next) {
    setTimeout(next, that.extraDelayMs || 0);
  });

  function awsLambdaWrapper(req, res, resource) {
    const event = {
      resource: resource,
      body: JSON.stringify(req.body),
      httpMethod: req.method,
      pathParameters: req.params,
      stageVariables: { tableName: dynamoDbTableName },
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

AwsLambdaExpressWrapper.prototype = {
  listen(extraDelayMs) {
    return dynamoDbStarted
      .then(_ => this.close())
      .then(_ => {
        return new Promise((resolve, reject) => {
          if (this.server) {
            throw Error('close() failed');
          }
          this.server = this.app.listen(apiServerPort);
          this.server.on('error', reject);
          this.server.on('listening', _ => resolve(this.server));

          // For quick .close()
          // See https://github.com/nodejs/node-v0.x-archive/issues/9066
          let timeoutInMs = 2000;

          this.extraDelayMs = extraDelayMs;
          if (extraDelayMs) {
            timeoutInMs += extraDelayMs;
            console.log('Will use extraDelayMs=' + extraDelayMs);
          }

          this.server.setTimeout(timeoutInMs);
        });
      })
      .then(server => server.address().port);
  },

  close() {
    return new Promise((resolve, reject) => {
      // Deliberately don't take down dynamoddb-local, because it does not matter
      // if it runs or not from a web app perspective, and if we kill it we lose
      // state we want to keep during tests since we use -inMemory
      if (this.server) {
        if (global.__coverage__) {
          // Simply to avoid collision without global state
          const randomNumber = Math.random() * Number.MAX_SAFE_INTEGER;
          fs.writeFileSync(
            `./coverage-data/coverage-${randomNumber}.json`,
            JSON.stringify(global.__coverage__)
          );
        }

        this.server.on('error', reject);
        this.server.on('close', resolve);
        this.server.close();
        this.server = null;
      } else {
        resolve();
      }
    });
  },
};

module.exports = AwsLambdaExpressWrapper;
