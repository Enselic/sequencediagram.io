const express = require('express');

const controllingServerPort = process.env.API_SERVER_CONTROL_PORT;

function controllerMessage(res, message) {
  res.send(message);
  console.log(message);
}

function ApiServerController(apiServer) {
  this.apiServer = apiServer;

  this.app = express();

  this.app.post('/listen', (req, res) => {
    let extraDelayMs =
      req.query.extraDelayMs && parseInt(req.query.extraDelayMs, 10);
    this.apiServer.listen(extraDelayMs).then(
      port => {
        controllerMessage(
          res,
          'Controller: API server listening on port ' +
            port +
            (extraDelayMs ? ' extraDelayMs=' + extraDelayMs : '')
        );
      },
      _ => {
        res.status(500);
        controllerMessage(res, 'Controller: Failed to listen!');
      }
    );
  });

  this.app.post('/close', (req, res) => {
    this.apiServer.close().then(
      _ => {
        controllerMessage(res, 'Controller: API server closed');
      },
      _ => {
        res.status(400);
        controllerMessage(res, 'Controller: Failed to close!');
      }
    );
  });
}

ApiServerController.prototype = {
  listen() {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(controllingServerPort);
      server.on('error', reject);
      server.on('listening', _ => resolve(server));
    }).then(server => server.address().port);
  },
};

module.exports = ApiServerController;
