const express = require('express');

const controllingServerPort = process.env.API_SERVER_CONTROL_PORT;

function generateResponse(res, status, message) {
  return () => {
    res.status(status);
    res.send(message);
  };
}

function ApiServerController(apiServer) {
  this.apiServer = apiServer;

  this.app = express();

  this.app.post('/listen', (req, res) => {
    let extraDelayMs =
      req.query.extraDelayMs && parseInt(req.query.extraDelayMs, 10);
    this.apiServer
      .listen(extraDelayMs)
      .then(port => {
        res.send(
          'Controller: API server listening on port ' +
            port +
            (extraDelayMs ? ' extraDelayMs=' + extraDelayMs : '')
        );
      })
      .catch(generateResponse(res, 500, 'Controller: Failed to listen!'));
  });

  this.app.post('/close', (req, res) => {
    this.apiServer
      .close()
      .then(generateResponse(res, 200, 'Controller: API server closed'))
      .catch(generateResponse(res, 500, 'Controller: Failed to close!'));
  });
}

ApiServerController.prototype = {
  listen() {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(controllingServerPort);
      server.on('error', reject);
      server.on('listening', () => resolve(server));
    }).then(server => server.address().port);
  },
};

module.exports = ApiServerController;
