/**
 * A backend server test cases can start and stop.
 */

/* Useful commands:

id=$( curl -v -H "Content-Type: application/json" -d '{"objects":[],"messages":[]}' localhost:7000/sequencediagrams | sed 's/.*"id":"\([^"]\+\)".*}/\1/g')
curl -v -H "Content-Type: application/json" -d '{"objects":[],"messages":[]}' localhost:7000/sequencediagrams/${id}
curl -v localhost:7000/sequencediagrams/${id}

curl -X POST --noproxy localhost http://localhost:7100/listen?extraDelayMs=5000
curl -X POST --noproxy localhost http://localhost:7100/listen
curl -X POST --noproxy localhost http://localhost:7100/close

*/

'use strict';

const ApiServerController = require('./ApiServerController');
const AwsLambdaExpressWrapper = require('./AwsLambdaExpressWrapper');

const apiServer = new AwsLambdaExpressWrapper();
const apiServerController = new ApiServerController(apiServer);

apiServer
  .listen()
  .then((port) => {
    console.log('API server listening on port ' + port);

    return apiServerController.listen();
  })
  .then((port) => {
    console.log('API server controller listening on port ' + port);
  })
  .catch(console.error);
